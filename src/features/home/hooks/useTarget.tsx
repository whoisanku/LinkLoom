import { useState } from "react";
import type { TTarget } from "../type/data";
import { TARGET_DATA } from "../constant/tableData.const";

export const useTarget = () => {
  const [targets, setTargets] = useState<TTarget[]>(TARGET_DATA);

  const getTargetById = (id: string) => {
    return targets.find(target => target.id === id);
  };

  const getAllTargets = () => {
    return targets;
  };

  const addTarget = (target: TTarget) => {
    setTargets(prev => [...prev, target]);
  };

  const updateTarget = (id: string, updates: Partial<TTarget>) => {
    setTargets(prev =>
      prev.map(target =>
        target.id === id ? { ...target, ...updates } : target
      )
    );
  };

  const deleteTarget = (id: string) => {
    setTargets(prev => prev.filter(target => target.id !== id));
  };

  const updateScore = (id: string, score: number) => {
    setTargets(prev =>
      prev.map(target =>
        target.id === id ? { ...target, score } : target
      )
    );
  };

  const updateRelevance = (id: string, relevance: string) => {
    setTargets(prev =>
      prev.map(target =>
        target.id === id ? { ...target, relevance } : target
      )
    );
  };

  const getTopTargets = (limit: number = 5) => {
    return [...targets].sort((a, b) => b.score - a.score).slice(0, limit);
  };

  const searchTargets = (query: string) => {
    const lowerQuery = query.toLowerCase();
    if (!lowerQuery || lowerQuery === '') return targets;
    return targets.filter(
      target =>
        target.username.toLowerCase().includes(lowerQuery) ||
        target.relevance.toLowerCase().includes(lowerQuery)
    );
  };

  const getTargetsByScoreRange = (minScore: number, maxScore: number) => {
    return targets.filter(target => target.score >= minScore && target.score <= maxScore);
  };

  return {
    targets,
    getTargetById,
    getAllTargets,
    addTarget,
    updateTarget,
    deleteTarget,
    updateScore,
    updateRelevance,
    getTopTargets,
    searchTargets,
    getTargetsByScoreRange,
  };
};
