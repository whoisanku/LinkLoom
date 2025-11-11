import { useState } from 'react';
import type { TIntroducer } from '../type/data';
import { INTRODUCER_DATA } from '../constant/tableData.const'; // adjust path as needed

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
