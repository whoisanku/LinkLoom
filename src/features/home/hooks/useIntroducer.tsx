import { useState } from 'react';
import type { TIntroducer, TTarget } from '../type/data';
import { INTRODUCER_DATA } from '../constant/tableData.const'; // adjust path as needed
import { useTarget } from './useTarget';

export const useIntroducer = () => {
  const [introducers, setIntroducers] = useState<TIntroducer[]>(INTRODUCER_DATA);

  const getIntroducerById = (id: string) => {
    return introducers.find(introducer => introducer.id === id);
  };

  const getAllIntroducers = () => {
    return introducers;
  };

  const addIntroducer = (introducer: TIntroducer) => {
    setIntroducers(prev => [...prev, introducer]);
  };

  const updateIntroducer = (id: string, updates: Partial<TIntroducer>) => {
    setIntroducers(prev =>
      prev.map(introducer =>
        introducer.id === id ? { ...introducer, ...updates } : introducer
      )
    );
  };

  const deleteIntroducer = (id: string) => {
    setIntroducers(prev => prev.filter(introducer => introducer.id !== id));
  };

  const addConnection = (introducerId: string, targetId: string) => {
    setIntroducers(prev =>
      prev.map(introducer =>
        introducer.id === introducerId
          ? {
            ...introducer,
            connections: [...introducer.connections, targetId],
          }
          : introducer
      )
    );
  };

  const removeConnection = (introducerId: string, targetId: string) => {
    setIntroducers(prev =>
      prev.map(introducer =>
        introducer.id === introducerId
          ? {
            ...introducer,
            connections: introducer.connections.filter(id => id !== targetId),
          }
          : introducer
      )
    );
  };

  const updateScore = (id: string, score: number) => {
    setIntroducers(prev =>
      prev.map(introducer =>
        introducer.id === id ? { ...introducer, score } : introducer
      )
    );
  };

  const getTopIntroducers = (limit: number = 5) => {
    return [...introducers].sort((a, b) => b.score - a.score).slice(0, limit);
  };

  const getIntroducersByConnectionCount = (minConnections: number) => {
    return introducers.filter(introducer => introducer.connections.length >= minConnections);
  };

  return {
    introducers,
    getIntroducerById,
    getAllIntroducers,
    addIntroducer,
    updateIntroducer,
    deleteIntroducer,
    addConnection,
    removeConnection,
    updateScore,
    getTopIntroducers,
    getIntroducersByConnectionCount,
  };
};


// Combined hook for managing relationships
export const useNetworking = () => {
  const introducerHook = useIntroducer();
  const targetHook = useTarget();

  const getConnectionsForIntroducer = (introducerId: string) => {
    const introducer = introducerHook.getIntroducerById(introducerId);
    if (!introducer) return [];

    return introducer.connections
      .map(targetId => targetHook.getTargetById(targetId))
      .filter(Boolean) as TTarget[];
  };

  const getIntroducersForTarget = (targetId: string) => {
    return introducerHook.introducers.filter(introducer =>
      introducer.connections.includes(targetId)
    );
  };

  const createConnection = (introducerId: string, targetId: string) => {
    const introducer = introducerHook.getIntroducerById(introducerId);
    const target = targetHook.getTargetById(targetId);

    if (!introducer || !target) return false;
    if (introducer.connections.includes(targetId)) return false;

    introducerHook.addConnection(introducerId, targetId);
    return true;
  };

  const removeConnection = (introducerId: string, targetId: string) => {
    introducerHook.removeConnection(introducerId, targetId);
  };

  const getNetworkStats = () => {
    const totalIntroducers = introducerHook.introducers.length;
    const totalTargets = targetHook.targets.length;
    const totalConnections = introducerHook.introducers.reduce(
      (sum: number, intro: TIntroducer) => sum + intro.connections.length,
      0
    );
    const avgConnectionsPerIntroducer = totalConnections / totalIntroducers;
    const avgIntroducerScore =
      introducerHook.introducers.reduce(
        (sum: number, intro: TIntroducer) => sum + intro.score,
        0
      ) / totalIntroducers;
    const avgTargetScore =
      targetHook.targets.reduce(
        (sum: number, target: TTarget) => sum + target.score,
        0
      ) / totalTargets;

    return {
      totalIntroducers,
      totalTargets,
      totalConnections,
      avgConnectionsPerIntroducer,
      avgIntroducerScore,
      avgTargetScore,
    };
  };

  return {
    ...introducerHook,
    ...targetHook,
    getConnectionsForIntroducer,
    getIntroducersForTarget,
    createConnection,
    removeConnection,
    getNetworkStats,
  };
};
