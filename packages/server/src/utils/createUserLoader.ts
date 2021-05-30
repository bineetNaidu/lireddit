import DataLoader from 'dataloader';
import { User } from '../entities/User';

export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    const usersMap: Record<number, User> = {};

    users.forEach((u) => {
      usersMap[u.id] = u;
    });

    return userIds.map((uid) => usersMap[uid]);
  });
