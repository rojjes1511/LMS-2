from flask_restful import Resource, reqparse
from flask import jsonify,request
from application.data.models import *
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity,create_access_token
from datetime import datetime
# Define the dictionary of user information
def cuser_to_dict(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
    }

user_parser = reqparse.RequestParser()
user_parser.add_argument('username')
user_parser.add_argument('password')
user_parser.add_argument('email')


section_parser = reqparse.RequestParser()
section_parser.add_argument('name')
section_parser.add_argument('description')
section_parser.add_argument('image')
section_parser.add_argument('dateCreated')



class UserAPI(Resource):
    def get(self):
        users = User.query.all()
        return jsonify([cuser_to_dict(user) for user in users])

    def post(self):
        post_data = request.get_json()
        username = post_data.get('username')
        password = post_data.get('password')
        email = post_data.get('email')
        user = User(username=username, password=generate_password_hash(password), email=email)
        db.session.add(user)
        db.session.commit()
        return jsonify(cuser_to_dict(user))
    
    @jwt_required()
    def delete(self):
        id = get_jwt_identity()
        user=User.query.filter_by(id=id).first()
        if not user:
            return jsonify({'message': 'No user found!'})
        role = UserRoles.query.filter_by(user_id=id).first()
        db.session.delete(role)
        db.session.commit()
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully!'})
    


def section_to_dict(section):
    return {
        'id': section.id,
        'name': section.name,
        'description': section.description,
        'image': section.image,
        'dateCreated': section.dateCreated,
    }
    
class SectionAPI(Resource):

    @jwt_required()
    def get(self):
        sections = Section.query.all()
        return jsonify([section_to_dict(section) for section in sections])
    
    @jwt_required()
    def post(self):
        post_data = section_parser.parse_args()
        name = post_data.get('name')
        description = post_data.get('description')
        image = post_data.get('image')
        dateCreated = post_data.get('dateCreated')
        dateCreated = datetime.strptime(dateCreated, '%Y-%m-%d')
        if name is None or description is None or image is None or dateCreated is None:
            return jsonify({'message': 'All fields are required!'})
        sec=Section.query.filter_by(name=name).first()
        if sec:
            return jsonify({'message': 'Section already exists!'})
        section = Section(name=name, description=description, image=image, dateCreated=dateCreated)
        db.session.add(section)
        db.session.commit()
        return jsonify({'message': 'Section added successfully!'})
    
    @jwt_required()
    def put(self,s_id):
        post_data = section_parser.parse_args()
        name = post_data.get('name')
        description = post_data.get('description')
        image = post_data.get('image')
        dateCreated = post_data.get('dateCreated')
        dateCreated = datetime.strptime(dateCreated, '%Y-%m-%d')
        section=Section.query.filter_by(id=s_id).first()
        if name is None or description is None or image is None or dateCreated is None:
            return jsonify({'message': 'All fields are required!'})
        if not section:
            return jsonify({'message': 'No section found!'})
        section.name = name
        section.description = description
        section.image = image
        section.dateCreated = dateCreated
        db.session.commit()
        return jsonify({'message': 'Section updated successfully!'})
    
    @jwt_required()
    def delete(self,s_id):
        id = get_jwt_identity()
        user=User.query.filter_by(id=id).first()
        if not user:
            return jsonify({'message': 'No user found!'})
        role = UserRoles.query.filter_by(user_id=id).first()
        if role.role_id != 1:
            return jsonify({'message': 'You are not authorized to delete section!'})
        section=Section.query.filter_by(id=s_id).first()
        if not section:
            return jsonify({'message': 'No section found!'})
        db.session.delete(section)
        db.session.commit()
        return jsonify({'message': 'Section deleted successfully!'})


def book_to_dict(book):
    return {
        'id': book.id,
        'name': book.title,
        'author': book.author,
        'image': book.image,
        'content': book.content,
        'section_id': book.section_id,
        'datePublished': book.datePublished,
        'returnDate': book.returnDate,
    }

book_parser = reqparse.RequestParser()
book_parser.add_argument('title')
book_parser.add_argument('content')
book_parser.add_argument('author')
book_parser.add_argument('image')
book_parser.add_argument('datePublished')
book_parser.add_argument('returnDate')


class BookAPI(Resource):

    @jwt_required()
    def get(self,s_id):
        books = Book.query.filter_by(section_id=s_id).all()
        return jsonify([book_to_dict(book) for book in books])
    
    @jwt_required()
    def post(self,s_id):
        post_data = book_parser.parse_args()
        title = post_data.get('title')
        content = post_data.get('content')
        author = post_data.get('author')
        image = post_data.get('image')
        datePublished = post_data.get('datePublished')
        returnDate = post_data.get('returnDate')
        print(title,author,datePublished,returnDate)
        datePublished = datetime.strptime(datePublished, '%Y-%m-%d')
        returnDate = datetime.strptime(returnDate, '%Y-%m-%d')
        
        if title is None or content is None or author is None or image is None or datePublished is None or returnDate is None:
            return jsonify({'message': 'All fields are required!'})
        book = Book(title=title, content=content, author=author, image=image, datePublished=datePublished, returnDate=returnDate, section_id=s_id)
        db.session.add(book)
        db.session.commit()
        return jsonify({'message': 'Book added successfully!'})
    
    @jwt_required()
    def put(self,b_id):
        post_data = request.get_json()
        title = post_data.get('title')
        content = post_data.get('content')
        author = post_data.get('author')
        image = post_data.get('image')
        datePublished = post_data.get('datePublished')
        returnDate = post_data.get('returnDate')
        datePublished = datetime.strptime(datePublished, '%Y-%m-%d')
        returnDate = datetime.strptime(returnDate, '%Y-%m-%d')
        book=Book.query.filter_by(id=b_id).first()
        if title is None or content is None or author is None or image is None or datePublished is None or returnDate is None:
            return jsonify({'message': 'All fields are required!'})
        if not book:
            return jsonify({'message': 'No book found!'})
        book.title = title
        book.content = content
        book.author = author
        book.image = image
        book.datePublished = datePublished
        book.returnDate = returnDate
        db.session.commit()
        return jsonify({'message': 'Book updated successfully!'})
    
    @jwt_required()
    def delete(self,b_id):
        id = get_jwt_identity()
        user=User.query.filter_by(id=id).first()
        if not user:
            return jsonify({'message': 'No user found!'})
        role = UserRoles.query.filter_by(user_id=id).first()
        if role.role_id != 1:
            return jsonify({'message': 'You are not authorized to delete book!'})
        book=Book.query.filter_by(id=b_id).first()
        if not book:
            return jsonify({'message': 'No book found!'})
        db.session.delete(book)
        db.session.commit()
        return jsonify({'message': 'Book deleted successfully!'})
    