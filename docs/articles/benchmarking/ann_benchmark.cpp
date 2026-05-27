#include <algorithm>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <iostream>
#include <limits>
#include <random>
#include <string>
#include <vector>

namespace {

struct Options {
  std::string mode = "hnsw";
  std::size_t n = 8192;
  std::size_t dim = 128;
  std::size_t queries = 2048;
  std::size_t degree = 16;
  std::size_t ef = 32;
  std::uint64_t seed = 1;
};

struct Dataset {
  std::vector<float> base;
  std::vector<float> query;
  std::vector<int> neighbors;
};

static inline float l2_distance(const float *a, const float *b, std::size_t dim) {
  float acc = 0.0f;
  for (std::size_t i = 0; i < dim; ++i) {
    const float diff = a[i] - b[i];
    acc += diff * diff;
  }
  return acc;
}

Options parse_options(int argc, char **argv) {
  Options opt;
  for (int i = 1; i < argc; ++i) {
    const char *arg = argv[i];
    auto next_value = [&](const char *name) -> const char * {
      if (i + 1 >= argc) {
        std::cerr << "missing value for " << name << "\n";
        std::exit(1);
      }
      return argv[++i];
    };

    if (std::strcmp(arg, "--mode") == 0) {
      opt.mode = next_value(arg);
    } else if (std::strcmp(arg, "--n") == 0) {
      opt.n = static_cast<std::size_t>(std::strtoull(next_value(arg), nullptr, 10));
    } else if (std::strcmp(arg, "--dim") == 0) {
      opt.dim = static_cast<std::size_t>(std::strtoull(next_value(arg), nullptr, 10));
    } else if (std::strcmp(arg, "--queries") == 0) {
      opt.queries = static_cast<std::size_t>(std::strtoull(next_value(arg), nullptr, 10));
    } else if (std::strcmp(arg, "--degree") == 0) {
      opt.degree = static_cast<std::size_t>(std::strtoull(next_value(arg), nullptr, 10));
    } else if (std::strcmp(arg, "--ef") == 0) {
      opt.ef = static_cast<std::size_t>(std::strtoull(next_value(arg), nullptr, 10));
    } else if (std::strcmp(arg, "--seed") == 0) {
      opt.seed = std::strtoull(next_value(arg), nullptr, 10);
    } else {
      std::cerr << "unknown argument: " << arg << "\n";
      std::exit(1);
    }
  }

  if (opt.n == 0 || opt.dim == 0 || opt.queries == 0 || opt.degree == 0 || opt.ef == 0) {
    std::cerr << "all size parameters must be non-zero\n";
    std::exit(1);
  }
  return opt;
}

Dataset make_dataset(const Options &opt) {
  Dataset ds;
  ds.base.resize(opt.n * opt.dim);
  ds.query.resize(opt.queries * opt.dim);
  ds.neighbors.resize(opt.n * opt.degree);

  std::mt19937_64 rng(opt.seed);
  std::uniform_real_distribution<float> dist(-1.0f, 1.0f);
  std::uniform_int_distribution<std::size_t> node_dist(0, opt.n - 1);

  for (float &value : ds.base) {
    value = dist(rng);
  }

  for (std::size_t q = 0; q < opt.queries; ++q) {
    const std::size_t src = q % opt.n;
    for (std::size_t d = 0; d < opt.dim; ++d) {
      const float base = ds.base[src * opt.dim + d];
      ds.query[q * opt.dim + d] = base + 0.01f * dist(rng);
    }
  }

  for (std::size_t node = 0; node < opt.n; ++node) {
    const std::size_t offset = node * opt.degree;
    for (std::size_t j = 0; j < opt.degree; ++j) {
      std::size_t nb = node_dist(rng);
      if (nb == node) {
        nb = (nb + 1) % opt.n;
      }
      ds.neighbors[offset + j] = static_cast<int>(nb);
    }
  }

  return ds;
}

[[gnu::noinline]] std::uint64_t flat_search(const Dataset &ds, const Options &opt) {
  std::uint64_t checksum = 0;
  for (std::size_t q = 0; q < opt.queries; ++q) {
    const float *query = &ds.query[q * opt.dim];
    float best_dist = std::numeric_limits<float>::infinity();
    std::size_t best_idx = 0;

    for (std::size_t i = 0; i < opt.n; ++i) {
      const float *base = &ds.base[i * opt.dim];
      const float dist = l2_distance(query, base, opt.dim);
      if (dist < best_dist) {
        best_dist = dist;
        best_idx = i;
      }
    }

    checksum += best_idx;
    checksum += static_cast<std::uint64_t>(best_dist);
  }
  return checksum;
}

[[gnu::noinline]] std::uint64_t hnsw_like_search(const Dataset &ds, const Options &opt) {
  std::uint64_t checksum = 0;

  for (std::size_t q = 0; q < opt.queries; ++q) {
    const float *query = &ds.query[q * opt.dim];
    std::size_t current = (q * 1315423911u) % opt.n;
    float current_dist = l2_distance(query, &ds.base[current * opt.dim], opt.dim);

    for (std::size_t step = 0; step < opt.ef; ++step) {
      std::size_t next = current;
      float next_dist = current_dist;
      const std::size_t offset = current * opt.degree;

      for (std::size_t j = 0; j < opt.degree; ++j) {
        const int nb_raw = ds.neighbors[offset + j];
        const std::size_t nb = static_cast<std::size_t>(nb_raw);
        const float dist = l2_distance(query, &ds.base[nb * opt.dim], opt.dim);
        if (dist < next_dist) {
          next_dist = dist;
          next = nb;
        }
      }

      checksum += current;
      checksum += static_cast<std::uint64_t>(current_dist);

      if (next == current) {
        next = static_cast<std::size_t>(ds.neighbors[offset + (step % opt.degree)]);
        next_dist = l2_distance(query, &ds.base[next * opt.dim], opt.dim);
      }

      current = next;
      current_dist = next_dist;
    }
  }

  return checksum;
}

double elapsed_seconds(const std::chrono::steady_clock::time_point &start,
                       const std::chrono::steady_clock::time_point &stop) {
  return std::chrono::duration_cast<std::chrono::duration<double>>(stop - start).count();
}

} // namespace

int main(int argc, char **argv) {
  const Options opt = parse_options(argc, argv);
  const Dataset ds = make_dataset(opt);

  const auto start = std::chrono::steady_clock::now();
  std::uint64_t checksum = 0;
  if (opt.mode == "flat") {
    checksum = flat_search(ds, opt);
  } else if (opt.mode == "hnsw") {
    checksum = hnsw_like_search(ds, opt);
  } else {
    std::cerr << "unknown mode: " << opt.mode << "\n";
    return 1;
  }
  const auto stop = std::chrono::steady_clock::now();

  const double seconds = elapsed_seconds(start, stop);
  std::cout << "mode=" << opt.mode
            << " n=" << opt.n
            << " dim=" << opt.dim
            << " queries=" << opt.queries
            << " degree=" << opt.degree
            << " ef=" << opt.ef
            << " seconds=" << seconds
            << " checksum=" << checksum
            << '\n';
  return 0;
}
