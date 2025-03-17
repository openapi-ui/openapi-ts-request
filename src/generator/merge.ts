import {
  type ClassDeclarationStructure,
  type EnumDeclarationStructure,
  type FunctionDeclarationOverloadStructure,
  type FunctionDeclarationStructure,
  type ImportDeclarationStructure,
  type InterfaceDeclarationStructure,
  Project,
  type SourceFile,
  type TypeAliasDeclarationStructure,
  type VariableStatementStructure,
} from 'ts-morph';
import * as ts from 'typescript';

import { type MergeOption, MergeRule, type MergerOptions } from './type';

const sortMapByKey = <T = unknown>(map: Map<string, T>) => {
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => ({ k, v }));
};

export class Merger {
  #project: Project;
  #sourceFile: SourceFile;
  #mergeRule: MergeRule;
  #mergedFile: SourceFile;
  #sourceCode: string;
  #leadingCommentRanges: string[] = [];
  constructor({
    srcPath,
    source,
    mergeRule = MergeRule.RIGHT,
    projectOptions = {},
  }: MergerOptions) {
    this.#project = new Project(projectOptions);
    if (srcPath) {
      this.#sourceFile = this.#project.addSourceFileAtPath(srcPath);
      this.#sourceCode = this.#sourceFile.getFullText().trim();
    } else if (source) {
      this.#sourceCode = source.trim();
      this.#sourceFile = this.#project.createSourceFile('_source_.ts', source);
    }
    try {
      if (this.#sourceCode) {
        this.#leadingCommentRanges = ts
          .getLeadingCommentRanges(this.#sourceCode, 0)
          .map((range) => {
            return this.#sourceCode.slice(range.pos, range.end);
          });
      }
    } catch (error) {
      // console.log(error, '>>>');
    }
    this.#mergeRule = mergeRule;
    this.#mergedFile = this.#project.createSourceFile('_merged_.ts');
  }

  #mergeClass(destFile: SourceFile) {
    const classMap = new Map<string, ClassDeclarationStructure>();
    this.#sourceFile.getClasses().forEach((c) => {
      const cName = c.getName();
      const cStructure = c.getStructure();
      classMap.set(cName, cStructure);
    });
    destFile.getClasses().forEach((c) => {
      const cName = c.getName();
      if (classMap.has(cName)) {
        if (this.#mergeRule === MergeRule.RIGHT) {
          const cStructure = c.getStructure();
          classMap.set(cName, cStructure);
        }
      } else {
        const cStructure = c.getStructure();
        classMap.set(cName, cStructure);
      }
    });
    sortMapByKey<ClassDeclarationStructure>(classMap).forEach(({ v }) => {
      this.#mergedFile.addClass(v);
    });
  }

  #mergeType(destFile: SourceFile) {
    const typeMap = new Map<string, TypeAliasDeclarationStructure>();
    this.#sourceFile.getTypeAliases().forEach((t) => {
      const tName = t.getName();
      const tStructure = t.getStructure();
      typeMap.set(tName, tStructure);
    });
    destFile.getTypeAliases().forEach((t) => {
      const tName = t.getName();
      if (typeMap.has(tName)) {
        if (this.#mergeRule === MergeRule.RIGHT) {
          const tStructure = t.getStructure();
          typeMap.set(tName, tStructure);
        }
      } else {
        const tStructure = t.getStructure();
        typeMap.set(tName, tStructure);
      }
    });

    sortMapByKey<TypeAliasDeclarationStructure>(typeMap).forEach(({ v }) => {
      this.#mergedFile.addTypeAlias(v);
    });
  }

  #mergeEnums(destFile: SourceFile) {
    const enumMap = new Map<string, EnumDeclarationStructure>();
    this.#sourceFile.getEnums().forEach((e) => {
      const eName = e.getName();
      const eStructure = e.getStructure();
      enumMap.set(eName, eStructure);
    });
    destFile.getEnums().forEach((e) => {
      const eName = e.getName();
      if (enumMap.has(eName)) {
        if (this.#mergeRule === MergeRule.RIGHT) {
          const eStructure = e.getStructure();
          enumMap.set(eName, eStructure);
        }
      } else {
        const eStructure = e.getStructure();
        enumMap.set(eName, eStructure);
      }
    });

    sortMapByKey<EnumDeclarationStructure>(enumMap).forEach(({ v }) => {
      this.#mergedFile.addEnum(v);
    });
  }

  #mergeInterfaces(destFile: SourceFile) {
    const interfaceMap = new Map<string, InterfaceDeclarationStructure>();
    this.#sourceFile.getInterfaces().forEach((i) => {
      const iName = i.getName();
      const iStructure = i.getStructure();
      interfaceMap.set(iName, iStructure);
    });
    destFile.getInterfaces().forEach((i) => {
      const iName = i.getName();
      if (interfaceMap.has(iName)) {
        if (this.#mergeRule === MergeRule.RIGHT) {
          const iStructure = i.getStructure();
          interfaceMap.set(iName, iStructure);
        }
      } else {
        const iStructure = i.getStructure();
        interfaceMap.set(iName, iStructure);
      }
    });

    sortMapByKey<InterfaceDeclarationStructure>(interfaceMap).forEach(
      ({ v }) => {
        this.#mergedFile.addInterface(v);
      }
    );
  }

  #mergeFunctions(destFile: SourceFile) {
    const functionMap = new Map<
      string,
      FunctionDeclarationStructure | FunctionDeclarationOverloadStructure
    >();
    this.#sourceFile.getFunctions().forEach((f) => {
      const fName = f.getName();
      const fStructure = f.getStructure();
      functionMap.set(fName, fStructure);
    });
    destFile.getFunctions().forEach((f) => {
      const fName = f.getName();
      if (functionMap.has(fName)) {
        if (this.#mergeRule === MergeRule.RIGHT) {
          const fStructure = f.getStructure();
          functionMap.set(fName, fStructure);
        }
      } else {
        const fStructure = f.getStructure();
        functionMap.set(fName, fStructure);
      }
    });

    sortMapByKey<
      FunctionDeclarationStructure | FunctionDeclarationOverloadStructure
    >(functionMap).forEach(({ v }) => {
      this.#mergedFile.addFunction(v as FunctionDeclarationStructure);
    });
  }

  #mergeVariables(destFile: SourceFile) {
    const variableSet = new Map<string, VariableStatementStructure>();
    this.#sourceFile.getVariableStatements().forEach((v) => {
      const vStructure = v.getStructure();
      const vName = vStructure.declarations[0]?.name;
      variableSet.set(vName, vStructure);
    });
    destFile.getVariableStatements().forEach((v) => {
      const vStructure = v.getStructure();
      const vName = vStructure.declarations[0]?.name;
      if (variableSet.has(vName)) {
        if (this.#mergeRule === MergeRule.RIGHT) {
          variableSet.set(vName, vStructure);
        }
      } else {
        const vStructure = v.getStructure();
        variableSet.set(vName, vStructure);
      }
    });
    sortMapByKey<VariableStatementStructure>(variableSet).forEach(({ v }) => {
      this.#mergedFile.addVariableStatement(v);
    });
  }

  #mergeImports(destFile: SourceFile) {
    const importMap = new Map<string, ImportDeclarationStructure>();
    this.#sourceFile.getImportDeclarations().forEach((i) => {
      const iStructure = i.getStructure();
      importMap.set(iStructure.moduleSpecifier, iStructure);
    });
    destFile.getImportDeclarations().forEach((i) => {
      const iStructure = i.getStructure();
      const iModuleSpecifier = iStructure.moduleSpecifier;
      if (importMap.has(iModuleSpecifier)) {
        if (this.#mergeRule === MergeRule.RIGHT) {
          importMap.set(iModuleSpecifier, iStructure);
        }
      } else {
        importMap.set(iModuleSpecifier, iStructure);
      }
    });

    sortMapByKey<ImportDeclarationStructure>(importMap).forEach(({ v }) => {
      this.#mergedFile.addImportDeclaration(v);
    });
  }

  public merge({ srcPath, source }: MergeOption) {
    let destFile: SourceFile;
    if (srcPath) {
      destFile = this.#project.addSourceFileAtPath(srcPath);
    } else if (source) {
      if (!source.trim()) {
        return this.#sourceCode;
      }
      destFile = this.#project.createSourceFile('_dest_.ts', source);
    }
    if (!this.#sourceCode) {
      return destFile.getFullText();
    }
    const destCode = destFile.getFullText().trim();
    if (this.#sourceCode === destCode) {
      return this.#sourceCode;
    }
    this.#mergeImports(destFile);
    this.#mergeVariables(destFile);
    this.#mergeClass(destFile);
    this.#mergeType(destFile);
    this.#mergeEnums(destFile);
    this.#mergeInterfaces(destFile);
    this.#mergeFunctions(destFile);
    const leadingComment = this.#leadingCommentRanges.join('\n');
    if (leadingComment) {
      return `${leadingComment}\n${this.#mergedFile.getFullText()}`;
    }
    return this.#mergedFile.getFullText();
  }
}
