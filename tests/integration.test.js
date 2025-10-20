/**
 * Integration Tests
 * End-to-end testing of PetID functionality
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';

describe('PetID Integration Tests', () => {
  let canisterIds = {};

  beforeAll(async () => {
    try {
      // Ensure DFX is running
      try {
        execSync('dfx ping', { stdio: 'ignore' });
      } catch {
        console.log('🚀 Starting DFX replica for integration tests...');
        execSync('dfx start --background --clean', { stdio: 'inherit' });
        await new Promise(resolve => setTimeout(resolve, 8000));
      }

      // Deploy all canisters
      console.log('📦 Deploying all canisters...');
      execSync('dfx deploy', { stdio: 'inherit' });

      // Read canister IDs
      const canisterIdsPath = '.dfx/local/canister_ids.json';
      if (fs.existsSync(canisterIdsPath)) {
        canisterIds = JSON.parse(fs.readFileSync(canisterIdsPath, 'utf8'));
        console.log('✅ Canister IDs loaded:', Object.keys(canisterIds));
      }
    } catch (error) {
      console.error('❌ Integration test setup failed:', error);
      throw error;
    }
  }, 120000); // 2 minute timeout

  describe('Canister Deployment', () => {
    it('should have deployed backend canister', () => {
      expect(canisterIds.PetID_backend).toBeDefined();
      expect(canisterIds.PetID_backend.local).toBeDefined();
      console.log(`✅ Backend canister: ${canisterIds.PetID_backend.local}`);
    });

    it('should have deployed frontend canister', () => {
      expect(canisterIds.PetID_frontend).toBeDefined();
      expect(canisterIds.PetID_frontend.local).toBeDefined();
      console.log(`✅ Frontend canister: ${canisterIds.PetID_frontend.local}`);
    });

    it('should have generated declarations', () => {
      const backendDeclarations = 'src/declarations/PetID_backend';
      const frontendDeclarations = 'src/declarations/PetID_frontend';

      expect(fs.existsSync(backendDeclarations)).toBe(true);
      expect(fs.existsSync(frontendDeclarations)).toBe(true);
      
      // Check for specific declaration files
      expect(fs.existsSync(`${backendDeclarations}/index.js`)).toBe(true);
      expect(fs.existsSync(`${backendDeclarations}/PetID_backend.did.js`)).toBe(true);
      
      console.log('✅ All declarations generated successfully');
    });
  });

  describe('Project Configuration', () => {
    it('should have valid dfx.json configuration', () => {
      const dfxConfig = JSON.parse(fs.readFileSync('dfx.json', 'utf8'));
      
      expect(dfxConfig.canisters).toBeDefined();
      expect(dfxConfig.canisters.PetID_backend).toBeDefined();
      expect(dfxConfig.canisters.PetID_frontend).toBeDefined();
      
      // Check backend configuration
      expect(dfxConfig.canisters.PetID_backend.type).toBe('motoko');
      expect(dfxConfig.canisters.PetID_backend.main).toBe('src/PetID_backend/main.mo');
      
      // Check frontend configuration
      expect(dfxConfig.canisters.PetID_frontend.type).toBe('assets');
      expect(dfxConfig.canisters.PetID_frontend.source).toBeDefined();
      
      console.log('✅ DFX configuration is valid');
    });

    it('should have valid package.json scripts', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      expect(packageJson.scripts).toBeDefined();
      expect(packageJson.scripts.dev).toBeDefined();
      expect(packageJson.scripts.build).toBeDefined();
      expect(packageJson.scripts.test).toBeDefined();
      
      console.log('✅ Package.json scripts are configured');
    });
  });

  describe('Frontend Build Process', () => {
    it('should build frontend successfully', () => {
      try {
        console.log('🏗️ Building frontend...');
        execSync('npm run build --workspace src/PetID_frontend', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
        
        // Check if dist directory exists
        const distPath = 'src/PetID_frontend/dist';
        expect(fs.existsSync(distPath)).toBe(true);
        
        // Check for essential build files
        const indexHtml = `${distPath}/index.html`;
        expect(fs.existsSync(indexHtml)).toBe(true);
        
        console.log('✅ Frontend build completed successfully');
      } catch (error) {
        console.error('❌ Frontend build failed:', error.message);
        throw error;
      }
    }, 60000); // 1 minute timeout for build
  });

  describe('Asset Management', () => {
    it('should have proper asset configuration', () => {
      const assetConfig = 'src/PetID_frontend/public/.ic-assets.json5';
      
      if (fs.existsSync(assetConfig)) {
        console.log('✅ Asset configuration found');
      } else {
        console.log('ℹ️ Asset configuration not found, using defaults');
      }
      
      // Check for PWA files
      expect(fs.existsSync('src/PetID_frontend/public/manifest.json')).toBe(true);
      console.log('✅ PWA manifest found');
    });

    it('should validate service worker setup', () => {
      const swPath = 'src/PetID_frontend/public/sw.js';
      
      if (fs.existsSync(swPath)) {
        const swContent = fs.readFileSync(swPath, 'utf8');
        expect(swContent.length).toBeGreaterThan(0);
        console.log('✅ Service worker found and not empty');
      } else {
        console.log('ℹ️ Service worker will be generated during build');
      }
    });
  });

  describe('Internationalization Setup', () => {
    it('should have all language files', () => {
      const languages = ['pt', 'en', 'es'];
      
      languages.forEach(lang => {
        const langFile = `src/PetID_frontend/src/locales/${lang}/translation.json`;
        expect(fs.existsSync(langFile)).toBe(true);
        
        // Validate JSON format
        const translations = JSON.parse(fs.readFileSync(langFile, 'utf8'));
        expect(typeof translations).toBe('object');
        expect(Object.keys(translations).length).toBeGreaterThan(0);
      });
      
      console.log('✅ All language files are valid');
    });
  });

  describe('Dependency Validation', () => {
    it('should have all required frontend dependencies', () => {
      const frontendPackage = JSON.parse(
        fs.readFileSync('src/PetID_frontend/package.json', 'utf8')
      );
      
      const requiredDeps = [
        '@dfinity/agent',
        '@dfinity/auth-client',
        '@dfinity/candid',
        '@dfinity/principal',
        'react',
        'react-dom',
        'react-router-dom',
        'i18next',
        'react-i18next'
      ];
      
      requiredDeps.forEach(dep => {
        expect(frontendPackage.dependencies[dep]).toBeDefined();
      });
      
      console.log('✅ All required dependencies are present');
    });

    it('should have testing dependencies', () => {
      const rootPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      expect(rootPackage.devDependencies.vitest).toBeDefined();
      expect(rootPackage.devDependencies.c8).toBeDefined();
      
      console.log('✅ Testing framework dependencies installed');
    });
  });

  describe('Code Quality Checks', () => {
    it('should have no critical syntax errors in Motoko', () => {
      try {
        // Check if Motoko file compiles
        execSync('dfx build PetID_backend', { stdio: 'pipe' });
        console.log('✅ Motoko backend compiles without errors');
      } catch (error) {
        console.error('❌ Motoko compilation error:', error.message);
        throw error;
      }
    });

    it('should validate React component imports', () => {
      const componentDirs = [
        'src/PetID_frontend/src/componentes',
        'src/PetID_frontend/src/pages',
        'src/PetID_frontend/src/context'
      ];
      
      componentDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          const jsxFiles = files.filter(file => 
            file.endsWith('.jsx') || file.endsWith('.js')
          );
          
          expect(jsxFiles.length).toBeGreaterThan(0);
        }
      });
      
      console.log('✅ React components structure validated');
    });
  });

  describe('Performance Metrics', () => {
    it('should have reasonable bundle size', () => {
      const distPath = 'src/PetID_frontend/dist';
      
      if (fs.existsSync(distPath)) {
        const files = fs.readdirSync(distPath, { withFileTypes: true });
        let totalSize = 0;
        
        files.forEach(file => {
          if (file.isFile()) {
            const filePath = `${distPath}/${file.name}`;
            const stats = fs.statSync(filePath);
            totalSize += stats.size;
          }
        });
        
        // Should be less than 50MB for reasonable performance
        const maxSize = 50 * 1024 * 1024;
        expect(totalSize).toBeLessThan(maxSize);
        
        console.log(`✅ Bundle size: ${(totalSize / (1024 * 1024)).toFixed(2)}MB`);
      } else {
        console.log('ℹ️ Build dist folder not found, skipping size check');
      }
    });
  });
});