export function toPublicUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
    };
}

export function toPublicTeam(team) {
    return {
        id: team.id,
        name: team.name,
        description: team.description,
        ownerId: team.ownerId,
        members: [...team.members],
        createdAt: team.createdAt,
        updatedAt: team.updatedAt
    };
}
