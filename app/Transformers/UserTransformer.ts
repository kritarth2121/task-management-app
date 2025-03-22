import User from "App/Models/User";

export const userTransformer = (user: User) => {
    return {
        ...user.toJSON(),
    };
};

export const userCompactTransformer = (user: User) => {
    return {
        id: user.id,
        name: user.name,
    };
};

export const userCompactListTransformer = (users: User[]) => {
    return users?.map((user) => userCompactTransformer(user));
};

export const userListTransformer = (users: User[]) => {
    return users.map((user) => user.toJSON());
};
