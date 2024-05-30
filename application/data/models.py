from flask_security import UserMixin, RoleMixin
from flask_sqlalchemy import SQLAlchemy
import datetime

db = SQLAlchemy()

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True,autoincrement=True)
    username = db.Column(db.String(255), unique=True)
    email = db.Column(db.String(255), unique=True)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    last_visited = db.Column(db.DateTime(), default=datetime.datetime.now(), nullable=True)
    fs_uniquifier = db.Column(db.String(255), unique=True)
    roles = db.relationship('Role', secondary='userroles',backref=db.backref('users', lazy='dynamic'))
    

class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer(), primary_key=True,autoincrement=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class UserRoles(db.Model):
    __tablename__ = 'userroles'
    id = db.Column(db.Integer(), primary_key=True,autoincrement=True)
    user_id = db.Column(db.Integer(), db.ForeignKey('user.id', ondelete='CASCADE'))
    role_id = db.Column(db.Integer(), db.ForeignKey('role.id', ondelete='CASCADE'))

class Section(db.Model):
    __tablename__ = 'section'
    id = db.Column(db.Integer(), primary_key=True,autoincrement=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    image = db.Column(db.String, nullable=True)
    dateCreated = db.Column(db.DateTime(), default=datetime.datetime.now(), nullable=False)
    description = db.Column(db.String(255), nullable=False)

class Book(db.Model):
    __tablename__ = 'book'
    id = db.Column(db.Integer(), primary_key=True,autoincrement=True)
    title = db.Column(db.String(255), unique=True, nullable=False)
    content= db.Column(db.String, nullable=False)
    author = db.Column(db.String(255), nullable=False)
    image = db.Column(db.String, nullable=True)
    datePublished = db.Column(db.DateTime(), default=datetime.datetime.now(), nullable=False)
    returnDate = db.Column(db.DateTime(), default=datetime.datetime.now(), nullable=False)
    section_id = db.Column(db.Integer(), db.ForeignKey('section.id', ondelete='CASCADE'))
    section = db.relationship('Section', backref=db.backref('books', lazy='dynamic'))
    

class BookRequests(db.Model):
    __tablename__ = 'bookrequests'
    id = db.Column(db.Integer(), primary_key=True,autoincrement=True)
    user_id = db.Column(db.Integer(), db.ForeignKey('user.id', ondelete='CASCADE'))
    book_id = db.Column(db.Integer(), db.ForeignKey('book.id', ondelete='CASCADE'))
    dateRequested = db.Column(db.DateTime(), default=datetime.datetime.now(), nullable=False)
    dateReturn = db.Column(db.DateTime(), default=datetime.datetime.now(), nullable=False)
    status = db.Column(db.String(255), nullable=False, default='pending')
    user = db.relationship('User', backref=db.backref('bookrequests', lazy='dynamic'))
    book = db.relationship('Book', backref=db.backref('bookrequests', lazy='dynamic'))

class Rating(db.Model):
    __tablename__ = 'rating'
    id = db.Column(db.Integer(), primary_key=True,autoincrement=True)
    rating = db.Column(db.Integer(), nullable=False)
    comment = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer(), db.ForeignKey('user.id', ondelete='CASCADE'))
    book_id = db.Column(db.Integer(), db.ForeignKey('book.id', ondelete='CASCADE'))
    dateRated = db.Column(db.DateTime(), default=datetime.datetime.now(), nullable=False)
    user = db.relationship('User', backref=db.backref('ratings', lazy='dynamic'))
    book = db.relationship('Book', backref=db.backref('ratings', lazy='dynamic'))