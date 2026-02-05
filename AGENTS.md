# AGENTS.md

## Project Overview

JS-X-Ray is a sophisticated JavaScript AST (Abstract Syntax Tree) analysis tool designed for security research and code vulnerability detection. This document provides AI agents with the essential information to effectively work with and contribute to this project.

## Architecture

### Monorepo Structure
- **Main Package**: `@nodesecure/js-x-ray` - Primary analysis engine
- **Supporting Workspaces**:
  - `@nodesecure/js-x-ray-ai` - AI-powered analysis capabilities

### Core Components
- `AstAnalyser.ts` - Main analysis class for JavaScript security scanning
- `EntryFilesAnalyser.ts` - Multi-file project analysis
- `ProbeRunner.ts` - Security probe execution engine
- `SourceFile.ts` - Source code file representation
- `warnings.ts` - Security warning type definitions

## Security Detection Capabilities

### 15 Security Warning Categories

**Critical**:
- `obfuscated-code` - Code obfuscation detection
- `suspicious-file` - Excessive encoded literals

**Warning Level**:
- `unsafe-import` - Untraceable require/import statements
- `unsafe-regex` - ReDoS attack patterns
- `unsafe-stmt` - Dangerous statements (eval, Function constructor)
- `weak-crypto` - Weak cryptographic algorithms (MD5, SHA1)
- `shady-link` - Suspicious URLs/links
- `data-exfiltration` - Potential data theft patterns

**Information Level**:
- `parsing-error` - AST parsing failures
- `encoded-literal` - Hex/base64/Unicode encoded content
- `synchronous-io` - Sync I/O operations

## Development Workflow

### Essential Commands
```bash
# Build all workspaces
npm run build

# Run tests with coverage
npm run test

# Lint code across all workspaces
npm run lint

# Development mode (watch + test)
npm run dev
```

### Testing Strategy
- Uses Node.js native test runner
- Coverage with c8
- 100+ test files with real-world malware examples
- Test fixtures in `test/fixtures/` directory

## Code Analysis Pipeline

1. **Source Parsing**: JavaScript/TypeScript → AST using Meriyah parser
2. **Probe Execution**: Security probes analyze AST nodes
3. **Pattern Matching**: Detect obfuscation, encoded literals, unsafe patterns
4. **Dependency Tracking**: Trace require/import statements
5. **Warning Generation**: Produce structured security warnings
6. **Report Generation**: Comprehensive security analysis results

## Technology Stack

- **Language**: TypeScript (ESM modules)
- **AST Parser**: Meriyah (JavaScript/TypeScript parser)
- **Build System**: TypeScript compiler with project references
- **Testing**: Node.js native test runner with c8 coverage
- **Linting**: ESLint with TypeScript support
- **Package Management**: npm workspaces with changesets for versioning

## Key Directories

```
workspaces/js-x-ray/
├── src/                    # Main source code
│   ├── analysis/          # Analysis engine components
│   ├── probes/            # Security probe implementations
│   └── warnings/          # Warning type definitions
├── test/                  # Test suite
│   ├── fixtures/          # Real-world malware examples
│   └── unit/              # Unit tests
├── docs/                  # API documentation
└── examples/              # Usage examples
```

## AI Agent Guidelines

### Security Research Focus
This project is specifically designed for:
- Malicious JavaScript detection
- Supply chain security analysis
- Code obfuscation identification
- Vulnerability pattern recognition
- Security research and education

### Extensibility
- **Probe System**: Custom security probes can be added to `src/probes/`
- **Pipeline Architecture**: Modular analysis pipeline allows for custom processing stages
- **Warning Types**: New warning categories can be defined in `src/warnings/`

### Working with Malicious Code
- The project contains real malicious code samples for testing
- Always handle test fixtures with appropriate security precautions
- Use the provided test environment for safe code analysis

### Code Conventions
- TypeScript with strict type checking
- ESM module structure
- Comprehensive test coverage required
- Security-focused code review process

## API Usage

### Basic Analysis
```typescript
import { AstAnalyser } from "@nodesecure/js-x-ray";

const analyser = new AstAnalyser();
const results = await analyser.analyse(sourceCode);
```

### Multi-file Analysis
```typescript
import { EntryFilesAnalyser } from "@nodesecure/js-x-ray";

const analyser = new EntryFilesAnalyser();
const results = await analyser.analyse(filePaths);
```

## Contributing

### Adding New Security Probes
1. Create probe class in `src/probes/`
2. Implement required probe interface
3. Add tests in `test/unit/probes/`
4. Update documentation

### New Warning Types
1. Define warning type in `src/warnings/`
2. Add detection logic
3. Create test cases
4. Update warning documentation

## Resources

- **API Documentation**: `docs/api/`
- **Warning Documentation**: Root `docs/` directory
- **Real-world Examples**: `examples/` directory
- **Test Fixtures**: `test/fixtures/` (malicious code samples)

## Security Considerations

- This tool analyzes potentially malicious code
- Always use in isolated environments
- Follow security research best practices
- Report vulnerabilities responsibly

## Version Management

- Uses changesets for versioning
- Automated publishing workflow
- Semantic versioning across workspaces
- Backward compatibility maintained
