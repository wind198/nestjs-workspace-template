import { glob } from 'glob';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs';
import { groupBy, set, get, last } from 'lodash';
import * as yaml from 'js-yaml';
import * as path from 'path';

/**
 * Get all TS files in the given directory
 * @param dirToScan - The directory to scan
 * @returns A promise that resolves to an array of TS file paths
 */
export const getTsFiles = async (dirToScan: string): Promise<string[]> => {
  return await glob(`${dirToScan}/**/*.ts`, {
    nodir: true,
    ignore: ['**/node_modules/**', '**/dist/**'], // optional
  });
};

/**
 * Get all i18n calls in the given TS file
 * @param tsFilePath - The path to the TS file
 * @returns A promise that resolves to an array of translation keys
 */
export const getI18nCalls = (tsFilePath: string): string[] => {
  try {
    const fileContent = readFileSync(tsFilePath, 'utf8');
    const translationKeys: string[] = [];

    // Match patterns: this.i18n.t('key'), i18n.t('key'), and this.i18nService.t('key')
    const i18nCallRegex =
      /(?:this\.)?i18n(?:Service)?\.t\('([a-zA-Z0-9._-]+)'/g;

    const matches = fileContent.match(i18nCallRegex);
    if (matches) {
      // Extract the translation keys from the matches
      for (const match of matches) {
        // Extract the key from the match using the same regex pattern
        const keyMatch = match.match(/'([a-zA-Z0-9._-]+)'/);
        if (keyMatch) {
          translationKeys.push(keyMatch[1]);
        }
      }
    }

    return translationKeys;
  } catch (error) {
    console.error(`Error reading file ${tsFilePath}:`, error);
    return [];
  }
};

/**
 * Creates or updates language files based on translation keys
 * @param translationKeys - Array of translation keys (e.g., ['auth.login.title', 'auth.login.button'])
 * @param langDir - Directory where language files should be created
 */
const createLangFile = (translationKeys: string[], langDir: string) => {
  // Filter out keys without nested structure and group by first segment
  const validKeys = translationKeys.filter((key) => key.split('.').length >= 2);
  const groupedKeys = groupBy(validKeys, (key) => key.split('.')[0]);

  // Process each file group
  for (const [fileName, keys] of Object.entries(groupedKeys)) {
    const filePath = path.join(langDir, `${fileName}.yml`);

    try {
      // Read existing YAML content or start with empty object
      let existingContent: any = {};
      try {
        const fileContent = readFileSync(filePath, 'utf8');
        existingContent = yaml.load(fileContent) || {};
      } catch {
        // File doesn't exist or is empty, start with empty object
        console.log(`Creating new file: ${filePath}`);
        existingContent = {};
      }

      // Process each key to build nested structure
      for (const key of keys) {
        const segments = key.split('.');
        const keyPath = segments.slice(1); // Remove the first segment (file name)
        const nestedPath = keyPath.join('.');

        // Use lodash set to create nested structure, only if key doesn't exist
        if (!get(existingContent, nestedPath)) {
          set(existingContent, nestedPath, last(segments));
        }
      }

      // Write the updated content back to the file
      const yamlContent = yaml.dump(existingContent, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false,
      });

      writeFileSync(filePath, yamlContent, 'utf8');
      console.log(`Updated language file: ${filePath}`);
    } catch (error) {
      console.error(`Error processing file ${filePath}:`, error);
    }
  }
};

/**
 * Main function to generate language files from TypeScript files
 * @param sourceDir - Directory to scan for TypeScript files
 * @param langDir - Directory where language files should be created
 */
export const generateLangFiles = async (sourceDir: string, langDir: string) => {
  if (!existsSync(langDir)) {
    mkdirSync(langDir, { recursive: true } as any);
  }
  try {
    console.log(`Scanning TypeScript files in: ${sourceDir}`);
    const tsFiles = await getTsFiles(sourceDir);
    console.log(`Found ${tsFiles.length} TypeScript files`);

    const allTranslationKeys: string[] = [];

    for (const tsFile of tsFiles) {
      const keys = getI18nCalls(tsFile);
      allTranslationKeys.push(...keys);
    }

    console.log(`Found ${allTranslationKeys.length} translation keys`);

    if (allTranslationKeys.length > 0) {
      createLangFile(allTranslationKeys, langDir);
      console.log('Language files generated successfully!');
    } else {
      console.log('No translation keys found.');
    }
  } catch (error) {
    console.error('Error generating language files:', error);
  }
};

// Export the createLangFile function for direct use
export { createLangFile };

if (require.main === module) {
  const sourceDir = path.join(process.cwd(), 'apps', 'server', 'src');
  const langDir = path.join(process.cwd(), 'lang/en');
  void generateLangFiles(sourceDir, langDir);
}
