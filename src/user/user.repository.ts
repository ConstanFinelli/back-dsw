import orm from '../shared/db/orm.js';
import { User } from './user.entities.js';

const em = orm.em;

export class UserRepository {

    public async findByEmail(email: string): Promise<User | undefined> {
        const user = await em.findOne(User, { email }, { populate: ['category'] });
        if (!user) {
            return undefined;
        }
        return user as User;
    }

    public async findAll(): Promise<User[] | undefined> {
        const users = await em.find(User, {}, { 
            populate: ['category'],
            fields: ['id', 'name', 'surname', 'email', 'phoneNumber', 'category', 'createdAt', 'updatedAt']
        });
        return users as User[];
    }

    public async findOne(id: number): Promise<User | undefined> {
        const user = await em.findOneOrFail(User, { id }, { populate: ['category'] });
        return user as User;
    }

    public async add(user: User): Promise<User | undefined> {
        const userCreated = await em.create(User, user);
        await em.flush();
        return userCreated as User;
    }

    public async remove(id: number): Promise<User | undefined> {
        const removedUser = await em.getReference(User, id);
        await em.removeAndFlush(removedUser);
        return removedUser as User;
    }

    public async update(newUser: User): Promise<User | undefined> {
        if (!newUser.id) {
            throw new Error('User ID is required for update');
        }
        const user = await this.findOne(newUser.id);
        if (!user) {
            return undefined;
        }
        user.name = newUser.name || user.name;
        user.surname = newUser.surname || user.surname;
        user.email = newUser.email || user.email;
        user.phoneNumber = newUser.phoneNumber || user.phoneNumber;
        user.password = newUser.password || user.password;
        user.category = newUser.category || user.category;
        await em.flush();
        return user as User;
        }
    }

