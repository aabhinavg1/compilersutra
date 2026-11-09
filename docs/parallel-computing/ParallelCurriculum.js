import React from 'react';
import Link from '@docusaurus/Link';
import track from '../tracks/track.module.css';
import styles from '../tracks/curriculum.module.css';

const DOC = '/docs/parallel-computing';
const QUIZ = '/docs/mcq/questions/domain/parallel';

const ROADMAP = [
  {
    num: '1',
    label: 'Parallel Thinking',
    href: `${DOC}/chapter-1/`,
    question: 'What does it mean to run work at the same time?',
    covers: 'Sequential execution, concurrency, parallelism, races.',
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
    num: '2',
    label: 'CPU',
    href: `${DOC}/chapter-2/`,
    question: 'How does a CPU run multiple pieces of work?',
    covers: 'Threads, cores, mutexes, atomics, barriers.',
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
    num: '3',
    label: 'OpenMP',
    href: `${DOC}/chapter-3/`,
    question: 'How do we parallelize loops without manually managing every thread?',
    covers: 'Parallel regions, worksharing, reductions, scheduling.',
    mcq: `${QUIZ}/chapter-3/quiz/`,
    lessons: [
      ['3.1', 'parallel and for', 'parallel starts a team of threads.', `${DOC}/chapter-3/parallel-and-for/`],
      ['3.2', 'reduction', 'A reduction gives each thread a private copy, then combines them.', `${DOC}/chapter-3/reduction/`],
      ['3.3', 'sections and synchronization', 'Sections are a fixed split into different blocks.', `${DOC}/chapter-3/sections-and-synchronization/`],
      ['3.4', 'OpenMP project', 'The serial sum and the OpenMP sum print the same number.', `${DOC}/chapter-3/openmp-project/`],
    ],
  },
  {
    num: '4',
    label: 'Algorithms',
    href: `${DOC}/chapter-4/`,
    question: 'Which algorithms are naturally parallel?',
    covers: 'Map, reduce, histogram, stencil, scan, sort.',
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
    num: '5',
    label: 'SIMD',
    href: `${DOC}/chapter-5/`,
    question: 'What if one instruction processes several values?',
    covers: 'Vector lanes, vectorization, alignment, SIMD + threads.',
    mcq: `${QUIZ}/chapter-5/quiz/`,
    lessons: [
      ['5.1', 'What SIMD is', 'SIMD is one instruction applied to several values.', `${DOC}/chapter-5/what-simd-is/`],
      ['5.2', 'Vectorization', 'The compiler can widen a loop when iterations are independent.', `${DOC}/chapter-5/vectorization/`],
      ['5.3', 'SIMD and threads', 'Lanes share one instruction stream.', `${DOC}/chapter-5/simd-and-threads/`],
    ],
  },
  {
    num: '6',
    label: 'GPU',
    href: `${DOC}/chapter-6/`,
    question: 'What changes when thousands of workers execute on a device?',
    covers: 'GPU execution, memory, kernels, CUDA, ROCm, OpenCL, Vulkan.',
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
    num: '7',
    label: 'Distributed',
    href: `${DOC}/chapter-7/`,
    question: 'What happens when workers do not share memory?',
    covers: 'Processes, ranks, communication, collectives, MPI.',
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
    num: '8',
    label: 'Measuring',
    href: `${DOC}/chapter-8/`,
    question: 'Did we actually make the program faster?',
    covers: "Timing, speedup, efficiency, Amdahl's law, bandwidth, cache, profiling.",
    mcq: `${QUIZ}/chapter-8/quiz/`,
    lessons: [
      ['8.1', 'Speedup and Amdahl', 'Speedup is serial time divided by parallel time, on the same work.', `${DOC}/chapter-8/speedup-and-amdahl/`],
      ['8.2', 'Cache and false sharing', 'Cores keep recently used memory in cache lines.', `${DOC}/chapter-8/cache-and-false-sharing/`],
      ['8.3', 'Memory bandwidth', 'Bandwidth is how many bytes the machine can move per second.', `${DOC}/chapter-8/memory-bandwidth/`],
      ['8.4', 'Load balancing', 'Balance means the workers finish near the same time.', `${DOC}/chapter-8/load-balancing/`],
      ['8.5', 'Profiling', 'A profile is a measurement from a tool.', `${DOC}/chapter-8/profiling/`],
    ],
  },
];

const START_HERE = {
  href: `${DOC}/start-here/`,
  mcq: `${QUIZ}/start-here/quiz/`,
  lessons: [
    ['1', 'How to use this course', 'Read one page, then do the short exercise on that page.', `${DOC}/start-here/how-to-use-this-course/`],
    ['2', 'The list of numbers we keep reusing', 'One list of integers is the example for the whole course.', `${DOC}/start-here/the-list-of-numbers/`],
  ],
};

function QuizLink({mcq}) {
  if (!mcq) {
    return null;
  }
  return (
    <Link className={styles.quizLink} to={mcq} title="Chapter quiz" aria-label="Chapter quiz">
      Quiz
    </Link>
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
        Open
      </span>
    </Link>
  );
}

function LessonRow({id, title, covers, href}) {
  return (
    <div className={styles.lessonRow}>
      <span className={styles.id}>{id}</span>
      <div className={styles.copy}>
        <LessonTitle href={href}>{title}</LessonTitle>
        {covers ? <p className={styles.desc}>{covers}</p> : null}
      </div>
    </div>
  );
}

function ChapterCard({chapter, openByDefault}) {
  return (
    <details className={styles.roadmapCard} open={openByDefault}>
      <summary>
        <span className={styles.roadmapNum}>Chapter {chapter.num}</span>
        <span className={styles.roadmapLabel}>{chapter.label}</span>
        <span className={styles.chevron} aria-hidden="true" />
      </summary>
      <div className={styles.roadmapBody}>
        <p className={styles.roadmapQuestion}>{chapter.question}</p>
        <p className={styles.desc}>{chapter.covers}</p>
        <div className={styles.roadmapActions}>
          <Link className={styles.roadmapCta} to={chapter.href}>
            Open chapter
            <span aria-hidden="true">→</span>
          </Link>
          <QuizLink mcq={chapter.mcq} />
        </div>
        <div className={styles.partBody}>
          {chapter.lessons.map(([id, title, covers, href]) => (
            <LessonRow key={href} id={id} title={title} covers={covers} href={href} />
          ))}
        </div>
      </div>
    </details>
  );
}

export default function ParallelCurriculum() {
  return (
    <section className={track.section} id="roadmap" aria-labelledby="parallel-roadmap-title">
      <div className={track.sectionHead}>
        <span className={track.sectionStep}>Course roadmap</span>
        <h2 id="parallel-roadmap-title" className={styles.syllabusTitle}>
          Eight chapters, one problem
        </h2>
        <p className={track.sectionDesc}>
          Follow the chapters in order. Each chapter answers one question about the same
          computation. Open a chapter for its lessons; use Quiz only when a chapter quiz exists.
        </p>
      </div>

      <details className={styles.roadmapCard}>
        <summary>
          <span className={styles.roadmapNum}>Start</span>
          <span className={styles.roadmapLabel}>Start Here</span>
          <span className={styles.chevron} aria-hidden="true" />
        </summary>
        <div className={styles.roadmapBody}>
          <p className={styles.roadmapQuestion}>How do you use this course, and what is the shared example?</p>
          <div className={styles.roadmapActions}>
            <Link className={styles.roadmapCta} to={START_HERE.href}>
              Open Start Here
              <span aria-hidden="true">→</span>
            </Link>
            <QuizLink mcq={START_HERE.mcq} />
          </div>
          <div className={styles.partBody}>
            {START_HERE.lessons.map(([id, title, covers, href]) => (
              <LessonRow key={href} id={id} title={title} covers={covers} href={href} />
            ))}
          </div>
        </div>
      </details>

      <div className={styles.roadmapList}>
        {ROADMAP.map((chapter, index) => (
          <ChapterCard key={chapter.num} chapter={chapter} openByDefault={index === 0} />
        ))}
      </div>

      <div className={styles.resume}>
        <Link className={styles.resumeLink} to={`${DOC}/start-here/how-to-use-this-course/`}>
          Start the course
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
