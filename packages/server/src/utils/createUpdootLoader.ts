import DataLoader from 'dataloader';
import { Updoot } from '../entities/Updoot';

export const createUpdootLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Updoot | null>(
    async (keys) => {
      const updoots = await Updoot.findByIds(keys as any);
      const updootMaps: Record<string, Updoot> = {};

      updoots.forEach((doot) => {
        updootMaps[`${doot.userId}|${doot.postId}`] = doot;
      });

      return keys.map(
        (idKeys) => updootMaps[`${idKeys.userId}|${idKeys.postId}`]
      );
    }
  );
