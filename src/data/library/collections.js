import { aiPapers, aiTopic } from './ai';
import { coaPapers, coaTopic } from './coa';
import { compilersutraMaterialPapers, compilersutraMaterialTopic } from './compilersutraMaterial';
import { gpuPapers, gpuPapersTopic } from './gpuPapers';
import { llvmPapers, llvmTopic } from './llvm';
import { machineLearningPapers, machineLearningTopic } from './machineLearning';
import { mlirPapers, mlirTopic } from './mlir';

export const LIBRARY_TOPICS = [
  aiTopic,
  coaTopic,
  gpuPapersTopic,
  llvmTopic,
  mlirTopic,
  machineLearningTopic,
  compilersutraMaterialTopic,
];

export const LIBRARY_PAPERS = [
  ...aiPapers,
  ...coaPapers,
  ...gpuPapers,
  ...llvmPapers,
  ...mlirPapers,
  ...machineLearningPapers,
  ...compilersutraMaterialPapers,
];
