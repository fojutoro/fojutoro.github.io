from re import compile as regex_pattern
from json import dumps as json_dumper
from modules.database import create_new_user, check_email, check_username, try_login, store_posts, store_functions, execute, get_username, get_functions
from flask import session


def handle_login(email, password):
    return json_dumper(try_login(email, password))


def handle_register(username, email, password):
    error = False
    resp = {
        'status': "OK",
        'redirect': "/login"
    }

    if len(username) >= 36 or len(username) <= 4:
        error = True
        resp["reason"] = "Your username is either too short or too long. Please have your username be less than 36 characters and more than 4."
    elif check_username(username):
        error = True
        resp["reason"] = "A user with this name already exists. Please pick a different name."
    elif len(email) >= 254 or len(email) <= 6:
        error = True
        resp["reason"] = "Your email is either too short or too long. Please have your email be less than 254 and more than 6 characters."
    elif check_email(email):
        error = True
        resp["reason"] = "This email is already registered to a user."
    elif not bool(regex_pattern("^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$").match(email)):
        error = True
        resp["reason"] = "Your email does not match. Please provide a normal email. example@domain.com"
    elif password == {}:
        error = True
    
    if error:
        resp['status'] = "ERROR"
        resp['redirect'] = "/register"
        return json_dumper(resp)

    uuid = create_new_user(username, email, password)
    resp['uuid'] = uuid
    return json_dumper(resp)


def check_for_posts():
    return execute('SELECT * FROM posts;', 'select')


def handle_upload(json):
    uuid = session.get('uuid')
    title = json['title']
    comment = json['comment']
    functions = json['functions']
    post_uuid = store_posts(uuid, title, comment)
    store_functions(post_uuid, functions)
    resp = {
        "redirect": "/",
        "status": "SUCCESS"
    }
    return resp


def generate_posts(posts):
    head = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Board</title>
    <link rel="stylesheet" href="../static/styles/board.css">
</head>
<body>
    <h1>fojutoro.me</h1>
    <div class="board">
        <div class="posts">"""
    foot = """</div> 
        <a id="add_post" href="/graph">
            <p>+</p>
            <img src="../static/icons/add.svg" alt="">
        </a>
    </div>
<script src="../static/js/board.js"></script>
</body>
</html>"""
    str = ""
    for post in posts:
        username = get_username(post[1])
        str += f'<a onclick="graph(this.id)" id="{post[0]}" class="post">\n\t<h1 class="title">{post[2]}</h1>\n\t<h2 class="username">{username}</h2>\n\t<p class="comment">{post[3]}</p>\n'
        for function in get_functions(post[0]):
            str += f'\t<p style="color: {function[3]}">{function[2]}</p>\n'
        str += f'<div class="bottom"><h4 class="date">{post[5]}</h4>\n\t<h3 class="likes">{post[4]}</h3>\n\t</div>'
        str += '</a>'
    return head + str + foot


def handle_like(post_uuid):
    sql_command = (
        "UPDATE `posts` "
        "SET `likes` = `likes` + 1 "
        f"WHERE `uuid` = '{post_uuid}'"
    )
    execute(sql_command, "insert")


def handle_response(json):
    req_type = json['type']
    if req_type == 'register':
        resp = handle_register(json['username'], json['email'], json['password'])
    if req_type == 'login':
        resp = handle_login(json['email'], json['password'])
    if req_type == 'upload':
        resp = handle_upload(json)
    if req_type == 'get_post':
        data = get_functions(json['post_uuid'])
        if data != [] and data != -1:
            resp = {
                "data": data,
                "status": "SUCCESS",
            }
        else:
            resp = {
                "data": [],
                "status": "ERROR",
            }
    if req_type == 'like':
        resp = {}
        handle_like(json['uuid'])
    return json_dumper(resp)