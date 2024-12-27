

from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from dotenv import load_dotenv
import os
 

load_dotenv()
 
database_url = os.getenv("DATABASE_URL")
api_key = os.getenv("API_KEY")

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = api_key

CORS(app, supports_credentials=True)
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    balance = db.Column(db.Float, default=0.0) 

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    type = db.Column(db.String(10), nullable=False)  

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(username=data['username'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and bcrypt.check_password_hash(user.password, data['password']):
        session['user_id'] = user.id
        return jsonify({'message': 'Login successful', 'success': True, 'balance': user.balance})
    return jsonify({'message': 'Invalid credentials', 'success': False}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logged out successfully'})

@app.route('/deposit', methods=['POST'])
def deposit():
    if 'user_id' not in session:
        return jsonify({'message': 'Unauthorized'}), 401
    data = request.json
    user = User.query.get(session['user_id'])
    user.balance += data['amount']  
    new_transaction = Transaction(user_id=session['user_id'], amount=data['amount'], type='deposit')
    db.session.add(new_transaction)
    db.session.commit()
    return jsonify({'message': 'Deposit successful', 'balance': user.balance})

@app.route('/withdraw', methods=['POST'])
def withdraw():
    if 'user_id' not in session:
        return jsonify({'message': 'Unauthorized'}), 401
    data = request.json
    user = User.query.get(session['user_id'])
    if user.balance >= data['amount']:
        user.balance -= data['amount'] 
        new_transaction = Transaction(user_id=session['user_id'], amount=data['amount'], type='withdraw')
        db.session.add(new_transaction)
        db.session.commit()
        return jsonify({'message': 'Withdrawal successful', 'balance': user.balance})
    else:
        return jsonify({'message': 'Insufficient balance'}), 400

@app.route('/history', methods=['GET'])
def history():
    if 'user_id' not in session:
        return jsonify({'message': 'Unauthorized'}), 401
    transactions = Transaction.query.filter_by(user_id=session['user_id']).all()
    user = User.query.get(session['user_id'])
    history = [{'id': t.id, 'amount': t.amount, 'type': t.type} for t in transactions]
    return jsonify({'history': history, 'balance': user.balance})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
