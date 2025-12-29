#!/usr/bin/env node

/**
 * Mockups Import Script
 *
 * Usage:
 *   node scripts/import-mockups.js --csv mockups.csv
 *   node scripts/import-mockups.js --scan /path/to/mockups
 *
 * CSV Format:
 * collection,subcategory,sub_subcategory,design_name,drawing_color,base_color,product_type,file_path,variant_id,display_order
 *
 * File naming convention (for --scan):
 * {collection}/{design-name}-{drawing-color}-{base-color}-{product-type}.jpg
 * Example: first-contact/nx-01-black-white-tshirt.jpg
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function parseFileName(fileName) {
  const withoutExt = path.basename(fileName, path.extname(fileName));
  const parts = withoutExt.split('-');

  if (parts.length < 4) {
    console.warn(`Warning: Invalid filename format: ${fileName}`);
    return null;
  }

  const productType = parts.pop();
  const baseColor = parts.pop();
  const drawingColor = parts.pop();
  const designName = parts.join('-');

  return {
    design_name: designName,
    drawing_color: drawingColor,
    base_color: baseColor,
    product_type: productType
  };
}

function scanDirectory(dirPath, baseDir = dirPath) {
  const mockups = [];

  function scan(currentPath, collection = null) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        const newCollection = collection || item;
        scan(fullPath, newCollection);
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext)) {
          const parsed = parseFileName(item);
          if (parsed && collection) {
            const relativePath = path.relative(baseDir, fullPath);
            mockups.push({
              collection,
              ...parsed,
              file_path: '/' + relativePath.replace(/\\/g, '/')
            });
          }
        }
      }
    }
  }

  scan(dirPath);
  return mockups;
}

function parseCSV(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());

  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const mockups = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const mockup = {};

    headers.forEach((header, index) => {
      const value = values[index];

      if (value && value !== '') {
        if (header === 'display_order') {
          mockup[header] = parseInt(value, 10);
        } else if (header === 'is_active') {
          mockup[header] = value.toLowerCase() === 'true';
        } else {
          mockup[header] = value;
        }
      }
    });

    if (mockup.collection && mockup.design_name && mockup.file_path) {
      mockups.push(mockup);
    }
  }

  return mockups;
}

async function importMockups(mockups, options = {}) {
  const { dryRun = false, batchSize = 50 } = options;

  console.log(`\n📦 Found ${mockups.length} mockups to import`);

  if (dryRun) {
    console.log('\n🔍 DRY RUN - No data will be inserted\n');
    mockups.slice(0, 5).forEach((m, i) => {
      console.log(`${i + 1}. ${m.collection} / ${m.design_name} (${m.drawing_color} on ${m.base_color})`);
    });
    if (mockups.length > 5) {
      console.log(`... and ${mockups.length - 5} more`);
    }
    return;
  }

  let imported = 0;
  let failed = 0;

  for (let i = 0; i < mockups.length; i += batchSize) {
    const batch = mockups.slice(i, i + batchSize);

    try {
      const { data, error } = await supabase
        .from('product_mockups')
        .insert(batch)
        .select();

      if (error) throw error;

      imported += data.length;
      console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1}: ${data.length} mockups`);
    } catch (error) {
      failed += batch.length;
      console.error(`❌ Failed to import batch ${Math.floor(i / batchSize) + 1}:`, error.message);

      for (const mockup of batch) {
        try {
          const { error: singleError } = await supabase
            .from('product_mockups')
            .insert(mockup)
            .select();

          if (singleError) {
            console.error(`   ❌ Failed: ${mockup.design_name}:`, singleError.message);
          } else {
            imported++;
            failed--;
          }
        } catch (e) {
          console.error(`   ❌ Failed: ${mockup.design_name}`);
        }
      }
    }
  }

  console.log(`\n✨ Import complete!`);
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ❌ Failed: ${failed}`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node scripts/import-mockups.js --csv mockups.csv');
    console.log('  node scripts/import-mockups.js --scan /path/to/mockups');
    console.log('  node scripts/import-mockups.js --csv mockups.csv --dry-run');
    process.exit(1);
  }

  let mockups = [];
  let dryRun = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--csv') {
      const csvPath = args[++i];
      if (!csvPath || !fs.existsSync(csvPath)) {
        console.error(`Error: CSV file not found: ${csvPath}`);
        process.exit(1);
      }
      console.log(`📄 Reading CSV: ${csvPath}`);
      mockups = parseCSV(csvPath);
    } else if (arg === '--scan') {
      const dirPath = args[++i];
      if (!dirPath || !fs.existsSync(dirPath)) {
        console.error(`Error: Directory not found: ${dirPath}`);
        process.exit(1);
      }
      console.log(`📁 Scanning directory: ${dirPath}`);
      mockups = scanDirectory(dirPath);
    } else if (arg === '--dry-run') {
      dryRun = true;
    }
  }

  if (mockups.length === 0) {
    console.error('Error: No mockups found');
    process.exit(1);
  }

  await importMockups(mockups, { dryRun });
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
