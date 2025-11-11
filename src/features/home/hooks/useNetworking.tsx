import { useIntroducer } from "./useIntroducer";
import { useTarget } from "./useTarget";
import type { TTarget } from "../type/data";

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
      (sum, intro) => sum + intro.connections.length,
      0
    );
    const avgConnectionsPerIntroducer = totalConnections / totalIntroducers;
    const avgIntroducerScore = introducerHook.introducers.reduce(
      (sum, intro) => sum + intro.score,
      0
    ) / totalIntroducers;
    const avgTargetScore = targetHook.targets.reduce(
      (sum, target) => sum + target.score,
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
