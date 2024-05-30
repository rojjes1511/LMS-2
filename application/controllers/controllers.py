from flask import current_app as app, render_template, request, jsonify,flash
from flask_jwt_extended import jwt_required, get_jwt_identity,create_access_token
from application.data.models import *
from werkzeug.security import generate_password_hash, check_password_hash
from jinja2 import Template
import random
from application.jobs.email import send_email_user
import datetime
from main import cache



# Define the dictionary of user information
def cuser_to_dict(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
    }

# Define the dictionary of user information
def puser_to_dict(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'image': user.image,
    }

@app.route('/')
def hello_world():
    return render_template('index.html')


# Define the route for user login
@app.route('/userlogin', methods=['POST'])
def userlogin():
    post_data = request.get_json()
    username = post_data.get('username')
    password = post_data.get('password')

    with app.app_context():
        user_datastore = app.security.datastore
        user = User.query.filter_by(username=username).first()

        if not user:
            app.logger.info(f"No user found for username: {username}")
            return jsonify({'message': 'No user found!'})

        if check_password_hash(user.password, password):
            app.logger.info("Password validation successful")
            book_requests = BookRequests.query.filter_by(user_id=user.id).all()

            for book_request in book_requests:
                if (book_request.dateReturn < datetime.datetime.now() and
                    book_request.status!='returned' and not book_request.status=='revoked' and not book_request.status=='approved' and not book_request.status=='rejected'):
                    
                    try:
                        # Update the status to 'revoked' for overdue requests with specific status conditions
                        book_request.status = 'revoked'
                        db.session.commit()
                        
                        # Retrieve the associated book title for the email notification
                        book_title = Book.query.filter_by(id=book_request.book_id).first().title
                        
                        # Notify the user via email about the revoked book request
                        send_email_user(
                            to=user.email,
                            sub="Book Request Revoked",
                            message=f"Your book request for {book_title} has been revoked due to late return"
                        )
                        
                        flash("Some book requests were auto-revoked due to late return.", "info")  # Flash message for feedback

                    except Exception as e:
                        db.session.rollback()  # Rollback changes if an error occurs
                        flash(f"Error occurred while processing book request: {str(e)}", "error")

            # Commit any remaining changes to the database
            db.session.commit()
            access_token = create_access_token(identity=user.id)
            role=user_datastore.find_user(username=username).roles[0].name
            return jsonify({"token": access_token, "role": role})
        else:
            app.logger.warning("Password validation failed")
            return jsonify({"message": "Wrong Password"})
        

# Define the route for user logout
@app.route('/userlogout', methods=['POST'])
@jwt_required()
def userlogout():
    id=get_jwt_identity()
    user=User.query.filter_by(id=id).first()
    if not user:
        return jsonify({'message': 'No user logged in'})
    user.last_visited=datetime.datetime.now()
    db.session.commit()
    return jsonify({'message': 'User logged out successfully!'})


# Define the route for user profile
@app.route("/userprofile/", methods=['POST','PUT','GET'])
@cache.cached(timeout=1)
@jwt_required()
def userprofile():
    id = get_jwt_identity()
    if request.method=='GET':
        user=User.query.filter_by(id=id).first()
        return jsonify(puser_to_dict(user))
    if request.method=='PUT':
        post_data = request.get_json()
        image = post_data.get('image')
        password = post_data.get('password')
        user=User.query.filter_by(id=id).first()
        if not user:
            return jsonify({'message': 'No user logged in'})
        if image:
            user.image=image
            db.session.commit()
        if password:
            user.password=generate_password_hash(password)
            db.session.commit()
        return jsonify({'message': 'User updated successfully!'})

# Define the route for currentuser
@app.route('/currentuser/')
@jwt_required()
def currentuser():
    user=User.query.filter_by(id=get_jwt_identity()).first()
    if not user:
        return jsonify({'message': 'No user logged in'})
    return jsonify(cuser_to_dict(user))


# Define the route for user creation and listing
@app.route('/createuser/')
def createuser():
    user=User.query.all()
    return jsonify([cuser_to_dict(user) for user in user])


# Define the route for user creation
@app.route('/registeruser/', methods=['POST'])
def registeruser():
    post_data = request.get_json()
    username = post_data.get('username')
    email = post_data.get('email')
    password = post_data.get('password')
    if not username:
        return jsonify({'message': 'Username is required'})
    if not email:
        return jsonify({'message': 'Email is required'})
    if not password:
        return jsonify({'message': 'Password is required'})
    user = User.query.filter_by(username=username,email=email).first()
    if user:
        return jsonify({'message': 'Username already exists'})
    with app.app_context():
        user_datastore = app.security.datastore
        if not user_datastore.find_user(username=username) and not user_datastore.find_user(email=email):
            user_datastore.create_user(username=username, email=email, password=generate_password_hash(password))
            db.session.commit()
            user = user_datastore.find_user(username=username)
            role = user_datastore.find_role('user')
            user_datastore.add_role_to_user(user, role)
            db.session.commit()

    return jsonify({'message': 'User created successfully!'})



# Define the route for user resetpassword
@app.route('/resetpassword', methods=['PUT','POST'])
def resetpassword():
    if request.method=='POST':
        post_data = request.get_json()
        email = post_data.get('email')
        user = User.query.filter_by(email=email).first()
        genotp= random.randint(100000,999999) 
        if not user:
            return jsonify({'message': 'No user found!'})
        with open('templates/reset.html') as file_:
            template = Template(file_.read())
            message = template.render(otp=genotp)

        send_email_user(
            to=email,
            sub="Password Reset",
            message=message
        )

        return jsonify({'message': 'Password sent successfully!', 'otp': genotp, 'email': email})
    
    if request.method=='PUT':
        post_data = request.get_json()
        email = post_data.get('email')
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'message': 'No user found!'})
        password = generate_password_hash(post_data.get('password'))
        user.password=password
        db.session.commit()
        return jsonify({'message': 'Password reset successfully!'})


def book_to_dict(book,user_id):
    book_request = BookRequests.query.filter_by(book_id=book.id, user_id=user_id).order_by(BookRequests.dateRequested.desc()).first()
    request_status = ""
    if book_request and book_request.status!='returned':
            request_status = book_request.status
    else:
        request_status = "none"

    return {
        'id': book.id,
        'name': book.title,
        'author': book.author,
        'image': book.image,
        'content': book.content,
        'section_id': book.section_id,
        "section": Section.query.filter_by(id=book.section_id).first().name,
        'datePublished': book.datePublished,
        'returnDate': book.returnDate,
        "requestStatus": request_status
    }


@app.route('/userbooks', methods=['GET'])
@cache.cached(timeout=10)
@jwt_required()
def userbooks():
    user_id = get_jwt_identity()
    books = Book.query.all()
    return jsonify([book_to_dict(book,user_id) for book in books])

@app.route('/bookrequest/<b_id>', methods=['POST'])
@jwt_required()
def bookrequest(b_id):
    user_id = get_jwt_identity()
    book_id = b_id
    user = User.query.filter_by(id=user_id).first()
    book = Book.query.filter_by(id=book_id).first()
    bookrequestscount = BookRequests.query.filter(
        BookRequests.user_id == user_id,
        ~BookRequests.status.in_(['returned', 'rejected', 'revoked'])
    ).count()
    if bookrequestscount>=5:
        return jsonify({'message': 'You have reached the maximum limit of book requests!'})
    post_data = request.get_json()
    dateReturn = post_data.get('dateReturn')
    dateReturn = datetime.datetime.strptime(dateReturn, '%Y-%m-%dT%H:%M')

    if dateReturn<datetime.datetime.now():
        return jsonify({'message': 'Return date should be in the future!'})

    if not user:
        return jsonify({'message': 'No user logged in'})
    if not book:
        return jsonify({'message': 'No book found'})
    bookrequest = BookRequests.query.filter_by(user_id=user_id, book_id=book_id).first()
    if bookrequest and bookrequest.status!='returned' and bookrequest.status!='rejected' and bookrequest.status!='revoked':
        return jsonify({'message': 'Book already requested'})
    bookrequest = BookRequests(user_id=user_id, book_id=book_id, status='pending', dateRequested=datetime.datetime.now(), dateReturn=dateReturn)
    db.session.add(bookrequest)
    db.session.commit()
    return jsonify({'message': 'Book requested successfully!'})

@app.route('/mybooks', methods=['GET'])
@cache.cached(timeout=1)
@jwt_required()
def mybooks():
    user_id = get_jwt_identity()
    if not User.query.filter_by(id=user_id).first().roles[0].name != 'librarian':
        return jsonify({'message': 'Unauthorized'})

    bookrequests = BookRequests.query.filter_by(user_id=user_id).all()

    # Filter out BookRequests with missing book_id or section_id
    valid_bookrequests = [
        bookrequest for bookrequest in bookrequests
        if bookrequest.book_id is not None
        
    ]

    # Convert valid BookRequests to dictionary format using libbookreq_to_dict function
    book_dicts = [
        libbookreq_to_dict(Book.query.filter_by(id=bookrequest.book_id).first(), bookrequest)
        for bookrequest in valid_bookrequests
    ]

    return jsonify(book_dicts)


def libbookreq_to_dict(book, bookrequest):
    if book is None or bookrequest is None:
        return {}

    section = Section.query.filter_by(id=book.section_id).first()
    if section is None:
        return {}

    return {
        'id': book.id,
        'name': book.title,
        'author': book.author,
        'content': book.content,
        'rid': bookrequest.id,
        'section': section.name,
        'status': bookrequest.status,
        'dateRequested': bookrequest.dateRequested,
        'dateReturn': bookrequest.dateReturn,
        'username': User.query.filter_by(id=bookrequest.user_id).first().username if bookrequest.user_id else 'Unknown'
    }
@app.route('/returnbook/<rid>', methods=['POST'])
@jwt_required()
def returnbook(rid):
    user_id = get_jwt_identity()
    bookrequest = BookRequests.query.filter_by(id=rid,user_id=user_id).first()
    if not bookrequest:
        return jsonify({'message': 'No book request found'})
    bookrequest.status='returned'
    db.session.commit()
    return jsonify({'message': 'Book returned successfully!'})


def libbookreq_to_dict(book, bookrequest):
    if book is None or bookrequest is None:
        return {}  # Return empty dictionary if either book or bookrequest is None

    section_name = Section.query.filter_by(id=book.section_id).first().name if book.section_id else 'Unknown'
    username = User.query.filter_by(id=bookrequest.user_id).first().username if bookrequest.user_id else 'Unknown'

    return {
        'id': book.id,
        'name': book.title,
        'author': book.author,
        'content': book.content,
        'rid': bookrequest.id,
        'section': section_name,
        'status': bookrequest.status,
        'dateRequested': bookrequest.dateRequested,
        'dateReturn': bookrequest.dateReturn,
        'username': username
    }

@app.route('/bookrequests', methods=['GET', 'POST'])
@jwt_required()
def bookrequests():
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()

    if user is None or user.roles[0].name != 'librarian':
        return jsonify({'message': 'Unauthorized'}), 403

    if request.method == 'GET':
        bookrequests = BookRequests.query.all()
        filtered_requests = [req for req in bookrequests if req.book_id is not None]

        response_data = [
            libbookreq_to_dict(Book.query.filter_by(id=req.book_id).first(), req)
            for req in filtered_requests
        ]

        return jsonify(response_data)

    elif request.method == 'POST':
        post_data = request.get_json()
        bookrequest_id = post_data.get('bookrequest_id')
        status = post_data.get('status')

        bookrequest = BookRequests.query.filter_by(id=bookrequest_id).first()

        if not bookrequest:
            return jsonify({'message': 'No book request found'}), 404

        bookrequest.dateReturn = datetime.datetime.now()
        bookrequest.status = status
        db.session.commit()

        return jsonify({'message': 'Book request updated successfully!'}), 200
    
@app.route('/userstats', methods=['GET'])
@jwt_required()
def userstats():
    try:
        user_id = get_jwt_identity()
        user = User.query.filter_by(id=user_id).first()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Get all book requests for the authenticated user
        book_requests = BookRequests.query.filter_by(user_id=user_id).all()

        if not book_requests:
            return jsonify({'message': 'No book requests found for the user'}), 404

        # Dictionary to store the count of returned books per section
        section_counts = {}

        # Calculate the count of returned books per section for the user
        for book_request in book_requests:
            book = Book.query.filter_by(id=book_request.book_id).first()

            if not book:
                continue  # Skip to the next book request if book not found

            section = Section.query.filter_by(id=book.section_id).first()

            if not section:
                continue  # Skip to the next book request if section not found

            if book_request.status == 'returned':
                section_name = section.name

                if section_name in section_counts:
                    section_counts[section_name] += 1
                else:
                    section_counts[section_name] = 1

        # Prepare data for the pie chart (most liked sections)
        sorted_sections = sorted(section_counts.items(), key=lambda x: x[1], reverse=True)
        top_sections = dict(sorted_sections[:6])  # Select the top 6 most liked sections

        return jsonify(top_sections), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    
@app.route('/adminstats', methods=['GET'])
@jwt_required()
def adminstats():
    try:
        user_id = get_jwt_identity()
        user = User.query.filter_by(id=user_id).first()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Retrieve all book requests except those with 'pending' status
        book_requests = BookRequests.query.filter(BookRequests.status != 'pending').all()

        # Dictionary to store the count of requested books per section
        section_counts = {}

        # Process each book request to count requested books by section
        for book_request in book_requests:
            book = Book.query.filter_by(id=book_request.book_id).first()

            if book:
                section = Section.query.filter_by(id=book.section_id).first()

                if section:
                    section_name = section.name

                    if section_name in section_counts:
                        section_counts[section_name] += 1
                    else:
                        section_counts[section_name] = 1

        # Sort section counts by the number of requested books (descending)
        sorted_sections = sorted(section_counts.items(), key=lambda x: x[1], reverse=True)

        # Prepare data for the pie chart (top sections with most requested books)
        top_sections = dict(sorted_sections[:6])  # Select the top 6 sections with most requested books

        return jsonify(top_sections), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/ratebook/<bid>', methods=['POST'])
@jwt_required()
def ratebook(bid):
    user_id = get_jwt_identity()
    post_data = request.get_json()
    rating = post_data.get('rating')
    comment = post_data.get('comment')
    book = Book.query.filter_by(id=bid).first()
    if not book:
        return jsonify({'message': 'No book found'})
    rate = Rating.query.filter_by(book_id=bid, user_id=user_id).first()
    if rate:
        return jsonify({'message': 'Book already rated'})
    else:
        rate = Rating(rating=rating, comment=comment, user_id=user_id, book_id=bid, dateRated=datetime.datetime.now())
        db.session.add(rate)
        db.session.commit()
    return jsonify({'message': 'Book rated successfully!'})


@app.route('/bookratings/<bid>', methods=['GET'])
def bookratings(bid):
    ratings = Rating.query.filter_by(book_id=bid).all()
    return jsonify([{
        'id': rating.id,
        'rating': rating.rating*"⭐",
        'comment': rating.comment,
        'user_id': rating.user_id,
        'dateRated': rating.dateRated
    } for rating in ratings])



@app.route('/l_status', methods=['GET'])
def librarian_status():
    try:
        # Retrieve librarian status data
        num_returned_books = BookRequests.query.filter_by(status='returned').count()
        num_approved_books = BookRequests.query.filter(BookRequests.status != 'requested').count()
        num_pending_books = BookRequests.query.filter_by(status='pending').count()
        # Get book requests with related book and user information
        book_requests = BookRequests.query.filter(BookRequests.book_id.isnot(None)).all()
        
        # Construct response data with required fields  
        response_data = []
        for request in book_requests:
            book = Book.query.get(request.book_id)
            user = User.query.get(request.user_id)
            if book and user:
                response_data.append({
                    'id': request.id,
                    'bookName': book.title,
                    'bookImage': book.image,
                    'username': user.username,
                    'dateReturn': request.dateReturn,
                    'status': request.status
                })

        # Return a well-structured JSON response
        return jsonify({
            'numReturnedBooks': num_returned_books,
            'numApprovedBooks': num_approved_books,
            'bookRequests': response_data,
            'numPendingBooks': num_pending_books
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

from flask import request

from flask import request

@app.route('/u_status', methods=['GET'])
@jwt_required()  # Requires a valid JWT token for authentication
def user_status():
    try:
        # Retrieve user-specific status data for the authenticated user
        user_id = get_jwt_identity()  # Retrieve user ID from the JWT token
        if user_id is None:
            return jsonify({'error': 'User not authenticated'}), 401

        # Count the number of returned, approved, and pending books for the user
        num_returned_books = BookRequests.query.filter_by(user_id=user_id, status='returned').count()
        num_approved_books = BookRequests.query.filter_by(user_id=user_id, status='approved').count()
        num_pending_books = BookRequests.query.filter_by(user_id=user_id, status='pending').count()

        # Get book requests for the specific user with related book information
        book_requests = BookRequests.query.filter_by(user_id=user_id).all()

        # Construct response data with required fields
        response_data = []
        for request in book_requests:
            book = Book.query.get(request.book_id)
            user = User.query.get(request.user_id)
            if book:
                response_data.append({
                    'id': request.id,
                    'username': user.username,
                    'bookName': book.title,
                    'bookImage': book.image,
                    'dateReturn': request.dateReturn,
                    'status': request.status
                })

        # Return a well-structured JSON response
        return jsonify({
            'numReturnedBooks': num_returned_books,
            'numApprovedBooks': num_approved_books,
            'numPendingBooks': num_pending_books,
            'bookRequests': response_data
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500




