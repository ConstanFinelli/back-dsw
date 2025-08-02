import orm from '../shared/db/orm.js';
import { User } from './user.entities.js';

const em = orm.em;

export class UserRepository {

    public async findAll(): Promise<User[] | undefined> {
        const users = await em.find(User, {}, { populate: ['category'] });
        return users as User[];
    }

    public async findOne(id: number): Promise<User | undefined> {
        const user = await em.findOneOrFail(User, { id });
        return user as User;
    }

    public async add(user: User): Promise<User | undefined> {
        const userCreated = em.create(User, user);
        await em.flush();
        return userCreated as User;
    }

    public async remove(id: number): Promise<User | undefined> {
        const removedUser = await em.getReference(User, id);
        await em.removeAndFlush(removedUser);
        return removedUser as User;
    }

    public async update(id: number, newUser: User): Promise<User | undefined> {
        const updatedUser = await em.findOneOrFail(User, { id });
        em.assign(updatedUser, newUser);
        await em.flush();
        return updatedUser as User;
    }


}