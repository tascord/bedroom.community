"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var Data_1 = require("./Data");
var Message_1 = __importDefault(require("./Message"));
var Signer_1 = __importDefault(require("./Signer"));
var User = /** @class */ (function () {
    function User(data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        this.id = data.id;
        this._username = data.username;
        this._password = data.password;
        this._display_name = data.display_name;
        this._email = data.email;
        this._permissions = (_a = data.permissions) !== null && _a !== void 0 ? _a : {};
        this._created = new Date((_b = data.created) !== null && _b !== void 0 ? _b : Date.now());
        this._mfa = (_c = data.mfa) !== null && _c !== void 0 ? _c : undefined;
        this._email_verified = (_d = data.email_verified) !== null && _d !== void 0 ? _d : false;
        this._messages = ((_e = data.messages) !== null && _e !== void 0 ? _e : []).map(function (m) { return Message_1.default.from_id(m); });
        this._avatar = (_f = data.avatar) !== null && _f !== void 0 ? _f : 'default';
        this._bio = (_g = data.bio) !== null && _g !== void 0 ? _g : '';
        this._location = (_h = data.location) !== null && _h !== void 0 ? _h : '';
        this._website = (_j = data.website) !== null && _j !== void 0 ? _j : '';
        this._pronouns = (_k = data.pronouns) !== null && _k !== void 0 ? _k : [];
        if (!this.id)
            throw new Error('User must have an ID');
        if (!this._username)
            throw new Error('Username is required');
        if (!this._email)
            throw new Error('Email is required');
        if (!this._display_name)
            throw new Error('Display name is required');
        if (!this._password)
            throw new Error('Password is required');
    }
    /* ------------------------------------------------- */
    User.from_id = function (id) {
        if (!Data_1.Tables.Users.has(id))
            throw new Error("User with id '".concat(id, "' does not exist"));
        return new User(Data_1.Tables.Users.get(id));
    };
    User.from_username = function (username) {
        if (!Data_1.Tables.Username_ID_Map.has(username))
            throw new Error("User with username '".concat(username, "' does not exist"));
        return new User(Data_1.Tables.Users.get(Data_1.Tables.Username_ID_Map.get(username)));
    };
    User.from_identifier = function (identifier) {
        if (identifier.length === 13 && /^[0-9]+$/.test(identifier))
            return User.from_id(identifier);
        if (identifier.length > 3 && identifier.length < 20)
            return User.from_username(identifier);
        throw new Error("Invalid identifier '".concat(identifier, "'"));
    };
    User.from_token = function (token) {
        var _a;
        if (!Signer_1.default.verify(token))
            throw new Error('Unable to verify token');
        var data = (_a = Signer_1.default.decode(token)) === null || _a === void 0 ? void 0 : _a.payload;
        if (!data)
            throw new Error('Unable to decode token');
        var user = User.from_id(data.id);
        if (!user.password_matches(data.password) || !user.email_matches(data.email))
            throw new Error('Invalid token');
        return user;
    };
    /* ------------------------------------------------- */
    User.prototype.to_public = function () {
        return {
            id: this.id,
            username: this._username,
            display_name: this._display_name,
            permissions: this.permissions,
            created: this.created,
            email_verified: this.email_verified,
            messages: this._messages.map(function (m) { return m.id; }),
            avatar: this._avatar,
            bio: this._bio,
            location: this._location,
            website: this._website,
            pronouns: this._pronouns,
        };
    };
    User.prototype.to_token = function () {
        return {
            id: this.id,
            email: this._email,
            password: this._password,
        };
    };
    /* ------------------------------------------------- */
    User.prototype.save = function () {
        Data_1.Tables.Users.set(this.id, {
            id: this.id,
            username: this._username,
            password: this._password,
            display_name: this._display_name,
            email: this._email,
            permissions: this._permissions,
            created: this._created.getTime(),
            mfa: this._mfa,
            email_verified: this._email_verified,
            messages: this._messages.map(function (m) { return m.id; }),
            avatar: this._avatar,
            bio: this._bio,
            location: this._location,
            website: this._website,
            pronouns: this._pronouns,
        });
    };
    /* ------------------------------------------------- */
    User.create = function (username, email, password) {
        var id = this.generate_id();
        var user = new User({
            id: id,
            username: '', email: '', password: '',
        });
        try {
            user.username = username;
            user.email = email;
            user.password = password;
            user.display_name = username;
        }
        catch (e) {
            if (Data_1.Tables.Username_ID_Map.get(username) === id)
                Data_1.Tables.Username_ID_Map.delete(username);
            Data_1.Tables.Users.delete(user.id);
            throw e;
        }
        return user;
    };
    User.generate_id = function () {
        var id;
        do {
            id = Date.now().toString();
        } while (Data_1.Tables.Users.has(id));
        return id;
    };
    /* ------------------------------------------------- */
    User.prototype.password_matches = function (password) {
        return (0, crypto_1.createHash)('sha256').update(password).digest('hex') === this._password;
    };
    User.prototype.email_matches = function (email) {
        return this._email === email;
    };
    Object.defineProperty(User.prototype, "username", {
        /* ------------------------------------------------- */
        get: function () { return this._username; },
        set: function (username) {
            username = username.toLowerCase();
            if (username.length < 3 || username.length > 20)
                throw new Error('Username must be between 3 and 20 characters');
            if (!/^[a-z0-9_]+$/.test(username))
                throw new Error('Username must only contain letters, numbers, and underscores');
            if (Data_1.Tables.Username_ID_Map.has(username) && Data_1.Tables.Username_ID_Map.get(username).id !== this.id)
                throw new Error('Username is already taken');
            Data_1.Tables.Username_ID_Map.delete(this._username);
            Data_1.Tables.Username_ID_Map.set(username, this.id);
            this._username = username;
            this.save();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(User.prototype, "permissions", {
        get: function () { return this._permissions; },
        set: function (permissions) {
            this._permissions = permissions;
            this.save();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(User.prototype, "created", {
        get: function () { return this._created; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(User.prototype, "mfa", {
        get: function () { return this._mfa; },
        set: function (mfa) {
            this._mfa = mfa;
            this.save();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(User.prototype, "email_verified", {
        get: function () { return this._email_verified; },
        set: function (email_verified) {
            this._email_verified = email_verified;
            this.save();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(User.prototype, "messages", {
        get: function () { return this._messages; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(User.prototype, "avatar", {
        get: function () { return this._avatar; },
        set: function (avatar_id) {
            // TODO: check if avatar exists
            this._avatar = avatar_id;
            this.save();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(User.prototype, "bio", {
        get: function () { return this._bio; },
        set: function (bio) {
            this._bio = bio;
            this.save();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(User.prototype, "location", {
        get: function () { return this._location; },
        set: function (location) {
            this._location = location;
            this.save();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(User.prototype, "website", {
        get: function () { return this._website; },
        set: function (website) {
            this._website = website;
            this.save();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(User.prototype, "pronouns", {
        get: function () { return this._pronouns; },
        set: function (pronouns) {
            this._pronouns = pronouns;
            this.save();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(User.prototype, "email", {
        set: function (email) {
            if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email))
                throw new Error('Invalid email');
            this._email_verified = false;
            this.save();
            // TODO: this.send_email_verification();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(User.prototype, "password", {
        set: function (password) {
            if (password.length < 8)
                throw new Error('Password must be at least 8 characters');
            if (password.length > 64)
                throw new Error('Password must be at most 64 characters');
            this._password = (0, crypto_1.createHash)('sha256').update(password).digest('hex');
            this.save();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(User.prototype, "display_name", {
        set: function (display_name) {
            if (display_name.length < 3 || display_name.length > 20)
                throw new Error('Display name must be between 3 and 20 characters');
            this._display_name = display_name;
            this.save();
        },
        enumerable: false,
        configurable: true
    });
    return User;
}());
exports.default = User;
//# sourceMappingURL=User.js.map