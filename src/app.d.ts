import type { RESTGetAPIUserResult } from "discord.js";

// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      user?: RESTGetAPIUserResult;
    }
  }
}

export {};
