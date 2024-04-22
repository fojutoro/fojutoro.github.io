from flask import Flask, render_template, request, session
from modules.database import try_login
from modules.events import handle_response, check_for_posts, generate_posts

app = Flask(__name__, template_folder="templates/html", static_folder="templates/static")
app.secret_key = b'Y\xf1Xz\x00\xad|eQ\x80t \xca\x1a\x10K'

@app.route('/', methods=['POST'])
def handle_req():
    return handle_response(request.json)


@app.route('/login', methods=['GET'])
def handle_login():
    # TODO: Check for cookies
    return render_template('login.html')


@app.route('/register')
def handle_register():
    return render_template('register.html')


@app.route('/graph')
def handle_graph():
    if 'email' in session and 'password' in session:
        if try_login(session['email'], session['password'])['status'] == "SUCCESS":
            return render_template('graph.html')
    return render_template('login.html')


@app.route('/', methods=['GET'])
def handle_board():
    if 'email' in session and 'password' in session:
        if try_login(session['email'], session['password'])['status'] == "SUCCESS":
            posts = check_for_posts()
            if posts == []:
                return render_template('board.html')
            else:
                return generate_posts(posts)
    return render_template('welcome.html')


@app.errorhandler(404)
def handle_bad_request(e):
    return render_template('404.html'), 404


if __name__ == '__main__':
    app.run(port=5004)