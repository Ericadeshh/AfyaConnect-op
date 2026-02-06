/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_mpesa from "../actions/mpesa.js";
import type * as audit from "../audit.js";
import type * as auth from "../auth.js";
import type * as bookings from "../bookings.js";
import type * as clinics from "../clinics.js";
import type * as crons from "../crons.js";
import type * as darajaTest from "../darajaTest.js";
import type * as debugStk from "../debugStk.js";
import type * as directStkTest from "../directStkTest.js";
import type * as http from "../http.js";
import type * as mpesa from "../mpesa.js";
import type * as mpesaCallbacks from "../mpesaCallbacks.js";
import type * as mutations_mpesa from "../mutations/mpesa.js";
import type * as notifications from "../notifications.js";
import type * as paymentTracking from "../paymentTracking.js";
import type * as payments from "../payments.js";
import type * as permissions from "../permissions.js";
import type * as phoneFormatTest from "../phoneFormatTest.js";
import type * as physicians from "../physicians.js";
import type * as referralPayments from "../referralPayments.js";
import type * as referrals from "../referrals.js";
import type * as router from "../router.js";
import type * as seedData from "../seedData.js";
import type * as stats from "../stats.js";
import type * as stkDbOperations from "../stkDbOperations.js";
import type * as stkTest from "../stkTest.js";
import type * as testMpesa from "../testMpesa.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/mpesa": typeof actions_mpesa;
  audit: typeof audit;
  auth: typeof auth;
  bookings: typeof bookings;
  clinics: typeof clinics;
  crons: typeof crons;
  darajaTest: typeof darajaTest;
  debugStk: typeof debugStk;
  directStkTest: typeof directStkTest;
  http: typeof http;
  mpesa: typeof mpesa;
  mpesaCallbacks: typeof mpesaCallbacks;
  "mutations/mpesa": typeof mutations_mpesa;
  notifications: typeof notifications;
  paymentTracking: typeof paymentTracking;
  payments: typeof payments;
  permissions: typeof permissions;
  phoneFormatTest: typeof phoneFormatTest;
  physicians: typeof physicians;
  referralPayments: typeof referralPayments;
  referrals: typeof referrals;
  router: typeof router;
  seedData: typeof seedData;
  stats: typeof stats;
  stkDbOperations: typeof stkDbOperations;
  stkTest: typeof stkTest;
  testMpesa: typeof testMpesa;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
