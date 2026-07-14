import { pathToFileURL } from 'node:url';
import path from 'node:path';
import {
  buildMdxImportPlan,
  formatMdxAuditReport,
  formatMdxImportWriteResult,
  inspectMdxDirectory,
  resolveMdxImportExecutionMode,
  writeMdxImportPlan,
} from '../lib/posts/import';

interface CliOptions {
  json: boolean;
  postsDirectory: string;
  write: boolean;
  confirmWrite: boolean;
  help: boolean;
}

const usage = `Usage: tsx scripts/import-mdx.ts [options]

Runs a read-only MDX import audit by default. The dry-run never connects to a database.

Options:
  --json                 Print the machine-readable audit report
  --posts-dir <path>     Audit another posts directory (default: ./posts)
  --write                Enable database import (also requires --confirm-write)
  --confirm-write        Second explicit confirmation required with --write
  -h, --help             Show this help

Before writing, run this command without write flags and review the audit. Write mode
loads the project's .env files, requires DATABASE_URL, rejects any audit issue, and
aborts the complete transaction if any canonical path already exists.
`;

const parseArgs = (args: string[]): CliOptions => {
  const options: CliOptions = {
    json: false,
    postsDirectory: path.resolve(process.cwd(), 'posts'),
    write: false,
    confirmWrite: false,
    help: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--json') {
      options.json = true;
    } else if (argument === '--write') {
      options.write = true;
    } else if (argument === '--confirm-write') {
      options.confirmWrite = true;
    } else if (argument === '-h' || argument === '--help') {
      options.help = true;
    } else if (argument === '--posts-dir') {
      const value = args[index + 1];
      if (!value) throw new Error('--posts-dir requires a path.');
      options.postsDirectory = path.resolve(process.cwd(), value);
      index += 1;
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }
  }

  return options;
};

export const runImportMdxCli = async (args = process.argv.slice(2)) => {
  const options = parseArgs(args);
  if (options.help) {
    process.stdout.write(usage);
    return 0;
  }

  const mode = resolveMdxImportExecutionMode(options);
  const inspection = await inspectMdxDirectory(options.postsDirectory);
  const { report } = inspection;

  if (mode === 'dry-run') {
    process.stdout.write(
      options.json ? `${JSON.stringify(report, null, 2)}\n` : formatMdxAuditReport(report)
    );
    return report.summary.parseErrors > 0 || report.summary.incompatibilities > 0 ? 1 : 0;
  }

  const plan = buildMdxImportPlan(report, inspection.documents);
  const { loadEnvConfig } = await import('@next/env');
  loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production', {
    info: () => undefined,
    error: () => undefined,
  });

  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error('DATABASE_URL is required for --write.');
  const databasePoolMax = Number(process.env.DATABASE_POOL_MAX ?? 1);
  if (!Number.isInteger(databasePoolMax) || databasePoolMax < 1) {
    throw new Error('DATABASE_POOL_MAX must be a positive integer.');
  }

  const result = await writeMdxImportPlan(plan, {
    databaseUrl,
    databasePoolMax,
  });
  process.stdout.write(
    options.json
      ? `${JSON.stringify({ mode: 'write', audit: report, result }, null, 2)}\n`
      : formatMdxImportWriteResult(result)
  );

  return 0;
};

const entryPoint = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : '';
if (import.meta.url === entryPoint) {
  runImportMdxCli()
    .then((exitCode) => {
      process.exitCode = exitCode;
    })
    .catch((error) => {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    });
}
