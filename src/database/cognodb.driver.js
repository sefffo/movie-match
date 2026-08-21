import neo4j from "neo4j-driver";
import { env } from "../config/env.js";

let _driver = null;

export function getDriver() {
  if (!_driver) {
    _driver = neo4j.driver(
      env.cognodb.uri,
      neo4j.auth.basic(env.cognodb.user, env.cognodb.password),
      { maxConnectionPoolSize: 50 }
    );
  }
  return _driver;
}

export async function closeDriver() {
  if (_driver) {
    await _driver.close();
    _driver = null;
  }
}

export async function verifyConnectivity() {
  const driver = getDriver();
  await driver.verifyConnectivity();
}
