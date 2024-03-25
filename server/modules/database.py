from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from uuid import uuid4
from json import load as json_loader
from mysql.connector import connect, Error
from flask import session


def execute(sql_statement, type='insert'):
    db_conf = json_loader(open('db/db_config.json'))

    try:
        with connect(
            host=db_conf['public']['host'],
            user=db_conf['db']['user'],
            password=db_conf['db']['password'],
            database=db_conf['public']['database']
        ) as connection:
            with connection.cursor() as cursor:
                cursor.execute(sql_statement)
                if type == 'insert' or type == 'alter':
                    connection.commit()
                else:
                    return cursor.fetchall()
    except Error:
        return -1


def last_log(uuid):
    sql_statement = (
        f"UPDATE `users` SET `last_logged_in` = NOW() WHERE `users`.`uuid` = '{uuid}'"
    )
    execute(sql_statement, "alter")


def try_login(email, password):
    sql_statement = (
        f"SELECT password, uuid, username FROM users WHERE email = '{email}'"
    )
    try:
        data = execute(sql_statement, "select")
        if data != -1 and data != []:
            line_data = data[0]
            if PasswordHasher().verify(line_data[0], password):
                last_log(line_data[1])
                resp = {
                    "status": "SUCCESS",
                    "uuid": line_data[1],
                    "username": line_data[2],
                    "redirect": "/"
                }
                session['username'] = line_data[2]
                session['uuid'] = line_data[1]
                session['password'] = password
                session['email'] = email
                return resp
    except VerifyMismatchError:
        return {"status": "ERROR", "reason": "Your password is incorrect."}
    return {"status": "ERROR", "reason": "This email does not exist."}


def create_new_user(username, email, password):
    uuid = str(uuid4())

    sql_statement = (
        f"INSERT INTO users (`uuid`, `username`, `email`, `password`, `date_of_creation`, `last_logged_in`) "
        f"VALUES ('{uuid}', '{username}', '{email}', '{process_password(password)}', NOW(), NULL)"
    )

    x = execute(sql_statement, 'insert')

    return uuid if x != -1 else x


def check_username(username):
    sql_statement = (
        f"SELECT COUNT(*) FROM users WHERE username = '{username}'"
    )
    data = execute(sql_statement, "select")
    return data[0][0]


def check_email(email):
    sql_statement = (
        f"SELECT COUNT(*) FROM users WHERE email = '{email}'"
    )
    data = execute(sql_statement, "select")
    return data[0][0]


def store_posts(uuid, title, comment):
    post_uuid = str(uuid4())
    sql_statement = (
        f"INSERT INTO mp_db.posts ( `uuid`, `creator`, `title`, `comment`, `likes`, `date_of_creation`) "
        f"VALUES ('{post_uuid}', '{uuid}', '{title}', '{comment}', 0, NOW())"
    )
    execute(sql_statement, 'insert')

    return post_uuid


def store_functions(post_uuid, functions):
    for function in functions:
        sql_statement = (
            f"INSERT INTO functions (`ID`, `post`, `func`, `color`, `stroke_size`) "
            f"VALUES (NULL, '{post_uuid}', '{function[0]}', '{function[1]}', {function[2]})"
        )
        execute(sql_statement, 'insert')


def get_username(uuid):
    sql_statement = (
        f"SELECT username FROM users WHERE uuid = '{uuid}'"
    )
    data = execute(sql_statement, "select")
    return data[0][0]


def get_functions(post_uuid):
    sql_statement = (
        f"SELECT * FROM functions WHERE post = '{post_uuid}'"
    )
    return execute(sql_statement, "select")


def process_password(password):
    x = PasswordHasher().hash(password)
    return x