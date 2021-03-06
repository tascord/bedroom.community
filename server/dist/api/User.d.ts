import Community from "./Community";
import Message from "./Message";
export default class User {
    readonly id: string;
    private _username;
    private _password;
    private _display_name;
    private _email;
    private _communities;
    private _followers;
    private _following;
    private _permissions;
    private _created;
    private _mfa?;
    private _email_verified;
    private _messages;
    private _avatar;
    private _bio;
    private _location;
    private _website;
    private _pronouns;
    private _wall;
    constructor(data: {
        [key: string]: any;
    });
    static from_id(id: string): User;
    static from_username(username: string): User;
    static from_identifier(identifier: string): User;
    static from_token(token: string): User;
    to_public(): {
        id: string;
        username: string;
        display_name: string;
        communities: string[];
        followers: User[];
        following: User[];
        permissions: {
            [community_id: string]: number;
        };
        created: number;
        email_verified: boolean;
        messages: string[];
        avatar: string;
        bio: string;
        location: string;
        website: string;
        pronouns: string[];
        wall: string[];
    };
    to_token(): string;
    save(): void;
    static create(username: string, email: string, password: string): User;
    static generate_id(): void;
    password_matches(password: string): boolean;
    email_matches(email: string): boolean;
    join_community(community: Community): void;
    get username(): string;
    get permissions(): {
        [community_id: string]: number;
    };
    get created(): Date;
    get mfa(): string | undefined;
    get email_verified(): boolean;
    get messages(): Message[];
    get avatar(): string;
    get bio(): string;
    get location(): string;
    get website(): string;
    get pronouns(): string[];
    get communities(): Community[];
    get wall(): Message[];
    get followers(): User[];
    get following(): User[];
    set username(username: string);
    set email(email: string);
    set password(password: string);
    set display_name(display_name: string);
    set wall(wall: Message[]);
    set permissions(permissions: {
        [community_id: string]: number;
    });
    set mfa(mfa: string | undefined);
    set email_verified(email_verified: boolean);
    set avatar(avatar_id: string);
    set bio(bio: string);
    set location(location: string);
    set website(website: string);
    set pronouns(pronouns: string[]);
    set messages(messages: Message[]);
}
