import React from 'react';
import Link from '@docusaurus/Link';
import track from '../tracks/track.module.css';
import styles from '../tracks/curriculum.module.css';

const DOC = '/docs/parallel-computing';
const QUIZ = '/docs/mcq/questions/domain/parallel';

const MATERIALS = [
  {name: 'PPT', path: 'M5 4h10a1 1 0 0 1 1 1v12H4V5a1 1 0 0 1 1-1zm0 11h10M8 7h4'},
  {name: 'Video', path: 'M7 6.5v11l9-5.5-9-5.5z'},
  {name: 'Examples', path: 'M9 8 5 12l4 4M15 8l4 4-4 4'},
  {name: 'MCQ', path: 'M6 7h12M6 12h12M6 17h8'},
];

const COURSE = [
  {
    label: 'Start Here',
    href: `${DOC}/start-here/`,
    title: 'Start Here',
    mcq: `${QUIZ}/start-here/quiz/`,
    lessons: [
      ['1', 'How to use this course', 'Read one page, then do the short exercise on that page.', `${DOC}/start-here/how-to-use-this-course/`],
      ['2', 'The list of numbers we keep reusing', 'One list of integers is the example for the whole course.', `${DOC}/start-here/the-list-of-numbers/`],
    ],
  },
  {
    label: 'Chapter 1. Parallel Thinking',
    href: `${DOC}/chapter-1/`,
    title: 'Chapter 1: Parallel Thinking',
    mcq: `${QUIZ}/chapter-1/quiz/`,
    lessons: [
      ['1.1', 'A program is a list of steps', 'A program is steps in an order.', `${DOC}/chapter-1/a-program-is-a-list-of-steps/`],
      ['1.2', 'Why one core stops being enough', 'A core is the part of the chip that walks the steps.', `${DOC}/chapter-1/why-one-core-stops-being-enough/`],
      ['1.3', 'Sequential and parallel', 'Sequential: one worker, the whole list.', `${DOC}/chapter-1/sequential-and-parallel/`],
      ['1.4', 'Concurrent, parallel, and distributed', 'Concurrent: the work overlaps in time.', `${DOC}/chapter-1/concurrent-parallel-and-distributed/`],
      ['1.5', 'Your first parallel problem', 'A shared total, updated by two workers, can lose adds.', `${DOC}/chapter-1/your-first-parallel-problem/`],
    ],
  },
  {
    label: 'Chapter 2. CPU',
    href: `${DOC}/chapter-2/`,
    title: 'Chapter 2: CPU Parallelism',
    mcq: `${QUIZ}/chapter-2/quiz/`,
    lessons: [
      ['2.1', 'CPU cores', 'Each core can walk its own instruction stream.', `${DOC}/chapter-2/cpu-cores/`],
      ['2.2', 'Processes and threads', 'A process is a running program with its own memory.', `${DOC}/chapter-2/processes-and-threads/`],
      ['2.3', 'Shared memory', 'Threads in one process share the address space.', `${DOC}/chapter-2/shared-memory/`],
      ['2.4', 'Race conditions', 'A race is two threads using one location, and at least one of them writes.', `${DOC}/chapter-2/race-conditions/`],
      ['2.5', 'Mutex', 'A mutex lets one thread into a section at a time.', `${DOC}/chapter-2/mutex/`],
      ['2.6', 'Atomics', 'An atomic update finishes as one step to other threads.', `${DOC}/chapter-2/atomics/`],
      ['2.7', 'Waiting, and deadlock', 'A thread can wait for another thread to finish.', `${DOC}/chapter-2/waiting-and-deadlock/`],
    ],
  },
  {
    label: 'Chapter 3. OpenMP',
    href: `${DOC}/chapter-3/`,
    title: 'Chapter 3: OpenMP',
    mcq: `${QUIZ}/chapter-3/quiz/`,
    lessons: [
      ['3.1', 'parallel and for', 'parallel starts a team of threads.', `${DOC}/chapter-3/parallel-and-for/`],
      ['3.2', 'reduction', 'A reduction gives each thread a private copy, then combines them.', `${DOC}/chapter-3/reduction/`],
      ['3.3', 'sections and synchronization', 'Sections are a fixed split into different blocks.', `${DOC}/chapter-3/sections-and-synchronization/`],
      ['3.4', 'OpenMP project', 'The serial sum and the OpenMP sum print the same number.', `${DOC}/chapter-3/openmp-project/`],
    ],
  },
  {
    label: 'Chapter 4. Algorithms',
    href: `${DOC}/chapter-4/`,
    title: 'Chapter 4: Parallel Algorithms',
    mcq: `${QUIZ}/chapter-4/quiz/`,
    lessons: [
      ['4.1', 'Map', 'Map applies one function to each item, independently.', `${DOC}/chapter-4/map/`],
      ['4.2', 'Reduce', 'Reduce combines every item into one value.', `${DOC}/chapter-4/reduce/`],
      ['4.3', 'Histogram', 'A histogram counts how often each key appears.', `${DOC}/chapter-4/histogram/`],
      ['4.4', 'Matrix multiplication', 'One output element is a dot product of a row and a column.', `${DOC}/chapter-4/matrix-multiplication/`],
      ['4.5', 'Stencil', 'A stencil computes one cell from its neighbors.', `${DOC}/chapter-4/stencil/`],
      ['4.6', 'Scan', 'A scan produces a running total at every position.', `${DOC}/chapter-4/scan/`],
      ['4.7', 'Parallel sorting', 'Some pairs can be swapped at the same time.', `${DOC}/chapter-4/parallel-sorting/`],
    ],
  },
  {
    label: 'Chapter 5. SIMD',
    href: `${DOC}/chapter-5/`,
    title: 'Chapter 5: SIMD',
    mcq: `${QUIZ}/chapter-5/quiz/`,
    lessons: [
      ['5.1', 'What SIMD is', 'SIMD is one instruction applied to several values.', `${DOC}/chapter-5/what-simd-is/`],
      ['5.2', 'Vectorization', 'The compiler can widen a loop when iterations are independent.', `${DOC}/chapter-5/vectorization/`],
      ['5.3', 'SIMD and threads', 'Lanes share one instruction stream.', `${DOC}/chapter-5/simd-and-threads/`],
    ],
  },
  {
    label: 'Chapter 6. GPU',
    href: `${DOC}/chapter-6/`,
    title: 'Chapter 6: GPU Programming',
    mcq: `${QUIZ}/chapter-6/quiz/`,
    lessons: [
      ['6.1', 'Why GPUs', 'A GPU has a great many simple arithmetic units.', `${DOC}/chapter-6/why-gpus/`],
      ['6.2', 'GPU architecture', 'The host is the CPU side. The device is the GPU.', `${DOC}/chapter-6/gpu-architecture/`],
      ['6.3', 'Threads and blocks', 'Threads are grouped into a block.', `${DOC}/chapter-6/threads-and-blocks/`],
      ['6.4', 'SIMT', 'SIMT runs one instruction across a small group of threads.', `${DOC}/chapter-6/simt/`],
      ['6.5', 'GPU memory', 'Registers are private to one thread.', `${DOC}/chapter-6/gpu-memory/`],
      ['6.6', 'CUDA', 'CUDA names the host, the device, the copy, and the kernel for NVIDIA GPUs.', `${DOC}/chapter-6/cuda/`],
      ['6.7', 'HIP and ROCm', 'ROCm is the AMD stack: compiler, runtime, and libraries.', `${DOC}/chapter-6/hip-and-rocm/`],
      ['6.8', 'OpenCL', 'OpenCL finds a platform and a device, then builds a kernel.', `${DOC}/chapter-6/opencl/`],
      ['6.9', 'Vulkan', 'Vulkan compute runs a pipeline.', `${DOC}/chapter-6/vulkan/`],
      ['6.10', 'GPU project', 'Print the serial total and the device total.', `${DOC}/chapter-6/gpu-project/`],
    ],
  },
  {
    label: 'Chapter 7. Distributed',
    href: `${DOC}/chapter-7/`,
    title: 'Chapter 7: Distributed Computing',
    mcq: `${QUIZ}/chapter-7/quiz/`,
    lessons: [
      ['7.1', 'Why a cluster', 'A cluster is several machines, each with its own memory.', `${DOC}/chapter-7/why-a-cluster/`],
      ['7.2', 'MPI', 'A rank is one process in the MPI job.', `${DOC}/chapter-7/mpi/`],
      ['7.3', 'Send and receive', 'A send matches a receive by rank and tag.', `${DOC}/chapter-7/send-and-receive/`],
      ['7.4', 'Collective operations', 'Every rank calls a collective.', `${DOC}/chapter-7/collective-operations/`],
      ['7.5', 'Distributed project', 'Two ranks, two partial sums, one printed 28.', `${DOC}/chapter-7/distributed-project/`],
    ],
  },
  {
    label: 'Chapter 8. Measuring',
    href: `${DOC}/chapter-8/`,
    title: 'Chapter 8: Measuring',
    mcq: `${QUIZ}/chapter-8/quiz/`,
    lessons: [
      ['8.1', 'Speedup and Amdahl', 'Speedup is serial time divided by parallel time, on the same work.', `${DOC}/chapter-8/speedup-and-amdahl/`],
      ['8.2', 'Cache and false sharing', 'Cores keep recently used memory in cache lines.', `${DOC}/chapter-8/cache-and-false-sharing/`],
      ['8.3', 'Memory bandwidth', 'Bandwidth is how many bytes the machine can move per second.', `${DOC}/chapter-8/memory-bandwidth/`],
      ['8.4', 'Load balancing', 'Balance means the workers finish near the same time.', `${DOC}/chapter-8/load-balancing/`],
      ['8.5', 'Profiling', 'A profile is a measurement from a tool.', `${DOC}/chapter-8/profiling/`],
    ],
  },
  {
    label: 'Projects',
    href: `${DOC}/projects/`,
    title: 'Projects',
    mcq: `${QUIZ}/projects/quiz/`,
    lessons: [
      ['1', 'Project 1: CPU', 'Serial sum and OpenMP reduction, same total.', `${DOC}/projects/cpu-project/`],
      ['2', 'Project 2: SIMD', 'A scalar loop and a widened loop, or a compiler vectorization report.', `${DOC}/projects/simd-project/`],
      ['3', 'Project 3: GPU', 'Host total and device total.', `${DOC}/projects/gpu-project/`],
      ['4', 'Final project', 'One problem, two implementations, matching results.', `${DOC}/projects/final-project/`],
    ],
  },
];

const WRITTEN = [
  ['What a parallel program is', 'What is parallel computing?', '/docs/parallel-computing/fundamentals/what-is-parallel-computing'],
  ['Process, thread, core', 'Program, process, thread, core', '/docs/parallel-computing/fundamentals/program-process-thread-core'],
  ['Hardware picture', 'Parallel hardware', '/docs/parallel-computing/fundamentals/parallel-hardware-overview'],
  ['Amdahl and Gustafson', "Amdahl's and Gustafson's laws", '/docs/parallel-computing/fundamentals/amdahls-and-gustafsons-law'],
  ['How to measure a run', 'Measuring parallel performance', '/docs/parallel-computing/fundamentals/measuring-parallel-performance'],
  ['Memory models', 'Memory models', '/docs/parallel-computing/fundamentals/memory-models'],
  ['GPU, in one page', 'What is a GPU?', '/docs/gpu/what_is_gpu'],
  ['NVIDIA', 'CUDA', '/docs/gpu/platforms/cuda'],
  ['AMD', 'ROCm', '/docs/gpu/platforms/rocm'],
  ['Portable kernel language', 'OpenCL', '/docs/gpu/opencl/basic/what_is_opencl'],
  ['Cross-vendor compute', 'Vulkan', '/docs/gpu/platforms/vulkan'],
  ['Occupancy, memory, divergence', 'GPU optimizations', '/docs/gpu/optimizations'],
  ['Register pressure', 'Why GPU kernels fail', '/docs/compilers/techblog/register-pressure-on-gpu/'],
  ['C++ threads', 'Threads', '/docs/c++/advanced/threads'],
  ['OpenCL on AMD', 'Getting started on AMDGPU', '/docs/gpu/opencl/basic/getting_started_with_opencl_on_amdgpu'],
  ['GPU programming overview', 'GPU programming overview', '/docs/gpu/gpu_programming/gpu_programming_toc'],
  ['GPU platforms', 'GPU platforms', '/docs/gpu/platforms/'],
];

const LATER = [
  ['Why', ['Why a parallel program is a different program', 'Concurrent, parallel, and distributed']],
  ['The machine you already have', ['One core, made busier', 'SIMD, MIMD, and the interconnect', 'Shared memory versus distributed memory', 'Cache coherence and false sharing', 'Decomposition, tasks, and mapping', 'Communication cost and granularity', 'Speedup, efficiency, and scalability']],
  ['OpenMP and threads', ['Pthreads: create, join, mutex, and barrier', 'OpenMP regions, reductions, and loop-carried dependence', 'OpenMP schedules', 'OpenMP tasks and sections', 'C++ atomics and memory order', 'C++ parallel algorithms', 'Thread pools, work stealing, and oneTBB']],
  ['A cluster', ['What a cluster is', 'MPI send, receive, and matching', 'Broadcast and reduction as a tree', 'MPI collectives', 'Overlap communication with computation', 'Hybrid MPI and OpenMP']],
  ['Before a GPU could run your loop', ['The CPU ran out of cheap speed', 'Thousands of arithmetic units that could only draw', 'No language for those units']],
  ['CUDA', ['From the graphics pipeline to a processor you can program', 'CUDA: host, device, and the copy', 'CUDA grids, blocks, and threads', 'CUDA memory spaces', 'Coalescing and latency hiding', 'Floating point on the device', 'Decomposition for a GPU']],
  ['ROCm', ['The ROCm stack', 'HIP next to CUDA']],
  ['OpenCL, Vulkan, SYCL', ['OpenCL next to CUDA', 'Vulkan compute and SPIR-V', 'SYCL', 'OpenMP target offload']],
  ['After you have a number', ['A profile, not a guess']],
  ['Same example, two machines', ['Matrix-vector, by rows and by columns', 'Odd-even transposition sort', 'Parallel search, and speedup that lies', 'n-body: all pairs and the reduced force', 'FFT communication: exchange versus transpose']],
];

function Icon({d}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.glyph}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Materials({mcq}) {
  return (
    <ul className={styles.materials}>
      {MATERIALS.map((item) => {
        const ready = item.name === 'MCQ' && mcq;
        const label = ready ? 'MCQ' : `${item.name}, coming soon`;
        const icon = <Icon d={item.path} />;
        return (
          <li key={item.name}>
            {ready ? (
              <Link className={styles.material} to={mcq} title={label} aria-label={label}>
                {icon}
              </Link>
            ) : (
              <span className={styles.material} title={label}>
                {icon}
                <span className={styles.srOnly}>{label}</span>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function LessonTitle({href, children}) {
  if (!href) {
    return <span className={styles.lessonTitle}>{children}</span>;
  }
  return (
    <Link className={styles.lessonLink} to={href}>
      <span className={styles.lessonTitle}>{children}</span>
      <span className={styles.go} aria-hidden="true">
        Start
      </span>
    </Link>
  );
}

function LessonRow({id, title, covers, href, mcq, chapter}) {
  return (
    <div className={chapter ? styles.chapterRow : styles.lessonRow}>
      <span className={styles.id}>{id}</span>
      <div className={styles.copy}>
        <LessonTitle href={href}>{title}</LessonTitle>
        {covers ? <p className={styles.desc}>{covers}</p> : null}
      </div>
      <Materials mcq={mcq} />
    </div>
  );
}

export default function ParallelCurriculum() {
  return (
    <>
      <section className={track.section} id="syllabus" aria-labelledby="parallel-syllabus-title">
        <div className={track.sectionHead}>
          <span className={track.sectionStep}>Syllabus</span>
          <h2 id="parallel-syllabus-title" className={styles.syllabusTitle}>
            Follow the chapters in order
          </h2>
          <p className={track.sectionDesc}>
            Open a chapter to see its lessons. A title opens that page. The quiz icon opens the chapter quiz.
          </p>
        </div>
        <div className={styles.syllabus}>
          {COURSE.map((chapter, index) => (
            <details key={chapter.label} className={styles.part} open={index === 0}>
              <summary>
                <span>{chapter.label}</span>
                <span className={styles.chevron} aria-hidden="true" />
              </summary>
              <div className={styles.partBody}>
                <LessonRow id="" title={chapter.title} href={chapter.href} mcq={chapter.mcq} chapter />
                {chapter.lessons.map(([id, title, covers, href]) => (
                  <LessonRow key={href} id={id} title={title} covers={covers} href={href} />
                ))}
              </div>
            </details>
          ))}
        </div>
        <div className={styles.resume}>
          <Link className={styles.resumeLink} to={`${DOC}/start-here/`}>
            Start here
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className={track.section} id="already-written">
        <div className={track.sectionHead}>
          <span className={track.sectionStep}>Already written</span>
          <h2 className={track.sectionTitle}>Pages that were already on the site</h2>
          <p className={track.sectionDesc}>
            The CUDA, ROCm, OpenCL, and Vulkan links are existing tracks. The matching chapters above are the course lessons.
          </p>
        </div>
        <div className={styles.syllabus}>
          {WRITTEN.map(([topic, title, href], index) => (
            <LessonRow
              key={href}
              id={String(index + 1).padStart(2, '0')}
              title={title}
              covers={topic}
              href={href}
            />
          ))}
        </div>
      </section>

      <details className={styles.fold}>
        <summary>Still to write</summary>
        <p className={track.sectionDesc}>
          A line here turns into a link when that lesson is published.
        </p>
        {LATER.map(([label, items]) => (
          <div key={label} className={styles.chapterBlock}>
            <p className={styles.lessonTitle}>{label}</p>
            {items.map((item) => (
              <LessonRow key={item} id="" title={item} />
            ))}
          </div>
        ))}
      </details>
    </>
  );
}
