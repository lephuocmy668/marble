import chalk from 'chalk';
import { CoreError } from './error.model';

export type CoreErrorOptions = {
  contextMethod: string;
  contextPackage?: string;
};

export const stringifyStackTrace = (stackTrace: NodeJS.CallSite[]) =>
  stackTrace
    .map(s => chalk.gray(`    @ ${s}`))
    .join('\n  ');

export const coreErrorStackTraceFactory = (opts: CoreErrorOptions) => (message: string, stack: NodeJS.CallSite[]) => {
  const [method, file, ...restStack] = stack;
  const [line, col] = [file.getLineNumber() || 0, file.getColumnNumber() || 0];
  const packageName = opts.contextPackage || '@marblejs/core';
  const methodName = opts.contextMethod + ' : ' + (method.getMethodName() || '-');
  const fileName = file.getFileName() || '';

  return `
  ${chalk.red(`${packageName} error:`)}

  🚨  ${message}

  👉  ${chalk.yellow.bold(methodName)}
    @ file: ${chalk.underline(fileName)}
    @ line: [${line.toString()}:${col.toString()}]

  ${stringifyStackTrace(restStack)}\n`;
};

export const coreErrorFactory = (message: string, opts: CoreErrorOptions) =>
  new CoreError(
    message || 'Something is not right...',
    {
      stackTraceFactory: coreErrorStackTraceFactory(opts),
      context: coreErrorFactory,
    }
  );
