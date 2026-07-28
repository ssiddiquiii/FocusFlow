import React from 'react';
import { FlaticonJS, FlaticonGit, FlaticonGithub } from './FlaticonIcons';

export function JsLogo({ size = 20, className = '' }) {
  return <FlaticonJS size={size} className={className} />;
}

export function GitLogo({ size = 20, className = '' }) {
  return <FlaticonGit size={size} className={className} />;
}

export function GithubLogo({ size = 20, className = '' }) {
  return <FlaticonGithub size={size} className={className} />;
}
