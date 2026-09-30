#!/usr/bin/env node
/**
 * Tattoo Shop V2 - Unified E2E Test Suite Runner
 * Executes 4 systematic test tiers and frontend build/DOM assertions.
 */

import fs from 'node:fs';
import path from 'node:path';
import { CONFIG } from './config.ts';
import { ApiClient } from './framework/api_client.ts';
import { DomValidator } from './framework/dom_validator.ts';
import { runAllTests, clearQueue, getTestQueue } from './framework/test_runner.ts';

// Test Suites Registration
import { registerAuthEndpointsTests } from './tier1_feature_coverage/test_auth_endpoints.ts';
import { registerMfaEndpointsTests } from './tier1_feature_coverage/test_mfa_endpoints.ts';
import { registerUserProfileEndpointsTests } from './tier1_feature_coverage/test_user_profile_endpoints.ts';
import { registerGalleryEndpointsTests } from './tier1_feature_coverage/test_gallery_endpoints.ts';
import { registerSubscriptionEndpointsTests } from './tier1_feature_coverage/test_subscription_endpoints.ts';
import { registerMailEndpointsTests } from './tier1_feature_coverage/test_mail_endpoints.ts';
import { registerFrontendInteractionsTests } from './tier1_feature_coverage/test_frontend_interactions.ts';
import { registerAuthOnboardingLegalTests } from './tier1_feature_coverage/test_auth_onboarding_legal.ts';
import { registerRoleRoutingAndSubscriptionGuardsTests } from './tier1_feature_coverage/test_role_routing_and_subscription_guards.ts';

import { registerMissingHeadersTests } from './tier2_boundary_corner/test_missing_headers.ts';
import { registerInvalidTypesTests } from './tier2_boundary_corner/test_invalid_types_malformed.ts';
import { registerOversizedPayloadsTests } from './tier2_boundary_corner/test_oversized_payloads.ts';
import { registerAuthBoundariesTests } from './tier2_boundary_corner/test_auth_boundaries.ts';
import { registerSubscriptionBoundariesTests } from './tier2_boundary_corner/test_subscription_boundaries.ts';

import { registerClientLifecycleTests } from './tier3_cross_feature/test_client_lifecycle.ts';
import { registerArtistLifecycleTests } from './tier3_cross_feature/test_artist_lifecycle.ts';
import { registerDualInteractionTests } from './tier3_cross_feature/test_dual_interaction.ts';
import { registerSubscriptionLifecycleTests } from './tier3_cross_feature/test_subscription_lifecycle.ts';

import { registerCustomerQuoteScenarioTests } from './tier4_real_world/test_customer_quote_scenario.ts';
import { registerArtistOnboardingScenarioTests } from './tier4_real_world/test_artist_onboarding_scenario.ts';
import { registerSecurityInvalidationScenarioTests } from './tier4_real_world/test_security_invalidation_scenario.ts';
import { registerCatalogFilteringScenarioTests } from './tier4_real_world/test_catalog_filtering_scenario.ts';
import { registerRoleAccessScenarioTests } from './tier4_real_world/test_role_access_scenario.ts';

import { registerFrontendBuildTests } from './frontend_assertions/test_frontend_build.ts';
import { registerDomStructureTests } from './frontend_assertions/test_dom_structure.ts';

// Milestone 4: Comprehensive 20-Feature Test Suites
import { registerM4BrandingUiI18nTests } from './tier1_feature_coverage/test_m4_branding_ui_i18n.ts';
import { registerM4ContactWhatsAppTests } from './tier1_feature_coverage/test_m4_contact_whatsapp.ts';
import { registerM4HubGeolocationMapTests } from './tier1_feature_coverage/test_m4_hub_geolocation_map.ts';
import { registerM4BoundaryCasesTests } from './tier2_boundary_corner/test_m4_boundary_cases.ts';
import { registerM4CrossFeatureFlowsTests } from './tier3_cross_feature/test_m4_cross_feature_flows.ts';
import { registerM4RealWorldScenariosTests } from './tier4_real_world/test_m4_real_world_scenarios.ts';

function registerAllSuites(client: ApiClient, validator: DomValidator) {
  // Tier 1
  registerAuthEndpointsTests(client);
  registerMfaEndpointsTests(client);
  registerUserProfileEndpointsTests(client);
  registerGalleryEndpointsTests(client);
  registerSubscriptionEndpointsTests(client);
  registerMailEndpointsTests(client);
  registerFrontendInteractionsTests(validator);
  registerAuthOnboardingLegalTests(validator, client);
  registerRoleRoutingAndSubscriptionGuardsTests(validator, client);
  registerM4BrandingUiI18nTests(validator);
  registerM4ContactWhatsAppTests(validator);
  registerM4HubGeolocationMapTests(validator);

  // Tier 2
  registerMissingHeadersTests(client);
  registerInvalidTypesTests(client);
  registerOversizedPayloadsTests(client);
  registerAuthBoundariesTests(client);
  registerSubscriptionBoundariesTests(client);
  registerM4BoundaryCasesTests();

  // Tier 3
  registerClientLifecycleTests(client);
  registerArtistLifecycleTests(client);
  registerDualInteractionTests(client);
  registerSubscriptionLifecycleTests(client);
  registerM4CrossFeatureFlowsTests(validator);

  // Tier 4
  registerCustomerQuoteScenarioTests(client);
  registerArtistOnboardingScenarioTests(client);
  registerSecurityInvalidationScenarioTests(client);
  registerCatalogFilteringScenarioTests(client);
  registerRoleAccessScenarioTests(client);
  registerM4RealWorldScenariosTests(validator);

  // Frontend Build & DOM
  registerFrontendBuildTests(validator);
  registerDomStructureTests(validator);
}

async function main() {
  const args = process.argv.slice(2);

  // Command-line flag parsing
  const urlArgIndex = args.indexOf('--url');
  const targetUrl = urlArgIndex !== -1 && args[urlArgIndex + 1] ? args[urlArgIndex + 1] : CONFIG.baseUrl;

  const tierArgIndex = args.indexOf('--tier');
  const targetTier = tierArgIndex !== -1 && args[tierArgIndex + 1] ? args[tierArgIndex + 1] : undefined;

  const domOnly = args.includes('--dom-only');
  const buildOnly = args.includes('--build-only');
  const forceAll = args.includes('--force-all');
  const listOnly = args.includes('--list');
  const jsonOutput = args.includes('--json');
  const verbose = args.includes('--verbose') || CONFIG.verbose;

  const client = new ApiClient(targetUrl);
  const validator = new DomValidator(CONFIG.frontendDir);

  clearQueue();

  if (listOnly) {
    registerAllSuites(client, validator);
    const queue = getTestQueue();
    console.log('\n=============================================================');
    console.log(`  TATTOO SHOP V2 - E2E TEST CATALOG INVENTORY`);
    console.log(`  Total tests cataloged: ${queue.length}`);
    console.log('=============================================================\n');

    let currentSuite = '';
    queue.forEach((t, i) => {
      if (t.suiteName !== currentSuite) {
        currentSuite = t.suiteName;
        console.log(`\n[\x1b[36m${t.tier}\x1b[0m] \x1b[1m${t.suiteName}\x1b[0m`);
      }
      console.log(`  ${String(i + 1).padStart(3, ' ')}. ${t.testName}`);
    });
    console.log('\n=============================================================\n');
    process.exit(0);
  }

  console.log('-------------------------------------------------------------');
  console.log(` Target Backend API  : ${targetUrl}`);
  console.log(` Target Frontend Dir : ${validator.getActiveTargetDir()}`);
  console.log('-------------------------------------------------------------');

  // Check backend server availability
  const isOnline = await client.isServerReachable();
  if (!isOnline && !domOnly && !buildOnly && !forceAll) {
    console.log(`\n\x1b[33m[NOTICE]\x1b[0m Backend at ${targetUrl} is currently offline / not responding.`);
    console.log('         Running frontend assertions and validating test suite structure.');
    console.log('         To run full network tests against live API, start backend on port 8080 and rerun.\n');
  }

  // Register Suites
  if (buildOnly) {
    registerFrontendBuildTests(validator);
  } else if (domOnly) {
    registerFrontendBuildTests(validator);
    registerDomStructureTests(validator);
    registerFrontendInteractionsTests(validator);
    registerAuthOnboardingLegalTests(validator);
    registerRoleRoutingAndSubscriptionGuardsTests(validator);
  } else if (!isOnline && !forceAll) {
    // When offline, execute frontend and DOM tests and structural validation
    registerFrontendInteractionsTests(validator);
    registerDomStructureTests(validator);
    registerFrontendBuildTests(validator);
    registerAuthOnboardingLegalTests(validator);
    registerRoleRoutingAndSubscriptionGuardsTests(validator);
    // Milestone 4: Comprehensive 20-Feature Suites (Tiers 1-4)
    registerM4BrandingUiI18nTests(validator);
    registerM4ContactWhatsAppTests(validator);
    registerM4HubGeolocationMapTests(validator);
    registerM4BoundaryCasesTests();
    registerM4CrossFeatureFlowsTests(validator);
    registerM4RealWorldScenariosTests(validator);
  } else {
    // When online (or forceAll), register full 4-tier E2E suite
    registerAllSuites(client, validator);
  }

  // Execute
  const summary = await runAllTests({
    filterTier: targetTier,
    verbose,
  });

  if (jsonOutput) {
    const jsonPath = path.resolve(process.cwd(), 'results.json');
    fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2), 'utf-8');
    console.log(`Structured JSON results written to ${jsonPath}`);
  }

  if (summary.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Fatal Test Runner Exception:', err);
  process.exit(1);
});
