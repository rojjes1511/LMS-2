from flask import Flask
from flask_security import Security, SQLAlchemySessionUserDatastore
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_restful import Api
from application.data.models import db, User, Role
from application.config import LocalDevelopmentConfig
from application.jobs import workers
from flask_caching import Cache
from application.jobs.task import *


app=None
api=None
celery=None
cache=None

def create_app():
    app = Flask(__name__, template_folder="templates")
    print("Staring Local Development")
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    app.app_context().push()
    api = Api(app)
    CORS(app)
    jwt = JWTManager(app)
    app.app_context().push()
    datastore = SQLAlchemySessionUserDatastore(db.session, User, Role)
    app.security = Security(app, datastore)
    celery=workers.celery
    celery.conf.update(
        broker_url = app.config["CELERY_BROKER_URL"],
        result_backend = app.config["CELERY_RESULT_BACKEND"],
        timezone="Asia/Kolkata",
        broker_connection_retry_on_startup=True
        
    )

    celery.Task=workers.ContextTasks
    app.app_context().push()
    cache=Cache(app)
    app.app_context().push()
    return app, api,celery,cache



app,api,celery,cache=create_app()


from application.controllers.controllers import *
from application.controllers.api import *


api.add_resource(UserAPI, '/api/user')
api.add_resource(SectionAPI, '/api/section', '/api/section/<int:s_id>')
api.add_resource(BookAPI, '/api/book/section/<int:s_id>', '/api/book/<int:b_id>')

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True,port=5050)