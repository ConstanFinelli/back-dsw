import { MikroORM } from '@mikro-orm/core';
import config from './orm.config.js';

export const orm = await MikroORM.init(config);

export default orm;
