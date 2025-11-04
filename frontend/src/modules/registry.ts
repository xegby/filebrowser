import type { Component } from "vue";

type Target = string;

const registry = new Map<Target, Component[]>();

export function register(target: Target, component: Component) {
  const arr = registry.get(target) ?? [];
  arr.push(component);
  registry.set(target, arr);
}

export function list(target: Target): Component[] {
  return registry.get(target) ?? [];
}

