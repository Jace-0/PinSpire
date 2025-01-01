const { Model, DataTypes, Sequelize } = require('sequelize')
const { sequelize } = require('../util/db')

class User extends Model {
    // Class methods
    static async findById(id) {
      return await this.findOne({ where: 
        { id },
        attributes: { exclude: ['password_hash'] }
        });
    }
    static async findByEmail(email) {
      return await this.findOne({ where: { email }});
    }
  
    static async findByUsername(username) {
      return await this.findOne({ where: 
        { username },
        attributes: { exclude: ['password_hash'] }
    });
    }
  
    // Instance methods
    async updateLastLogin() {
      this.last_login = new Date();
      return await this.save();
    }
  }

User.init({
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
    },
    username: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    first_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            len: [0, 100]
        }
    },
    last_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            len: [0, 100]
        }
    },
    dob: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            notNull: {
                msg: 'Date of birth is required'
            },
            isDate: true,
            isBefore: new Date().toISOString(), // Must be in the past
            isAfter: new Date('1900-01-01').toISOString(), // Reasonable minimum date
            customValidator(value) {
                const age = Math.floor((new Date() - new Date(value)) / (365.25 * 24 * 60 * 60 * 1000));
                if (age < 13) {
                    throw new Error('User must be at least 13 years old');
                }
            }
        }
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other', 'prefer not to say'),
        allowNull: true,
        validate: {
            isIn: [['male', 'female', 'other', 'prefer not to say']]
        }
    },
    country: {
        type: DataTypes.STRING(2),
        allowNull: true,
        validate: {
            isUppercase: true,
            len: [2, 255]
        }
    },
    language: {
        type: DataTypes.STRING(2),
        allowNull: true,
        defaultValue: 'en',
        validate: {
            isLowercase: true,
            len: [2, 2]
        }
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    avatar_url: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    website_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    location: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    sequelize,
    underscored: true,
    timestamps: true,
    modelName: 'user',
    hooks: {
        beforeUpdate: (user) => {
            user.updated_at = new Date();
        }
    },
    indexes: [
        {
            unique: true,
            fields: ['email']
        },
        {
            unique: true,
            fields: ['username']
        }
    ]
})

module.exports = User