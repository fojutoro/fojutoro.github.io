import os
import json
import mysql.connector
from mysql.connector import errorcode


def create_database(connection, conf):
    cursor = connection.cursor()

    # Define the database creation query
    create_db_query = f"CREATE DATABASE IF NOT EXISTS {conf['public']['database']};"

    # Execute the query to create the database
    try:
        cursor.execute(create_db_query)
        print(f"success, crated '{conf['public']['database']}'")
    except mysql.connector.Error as err:
        print(f"err: {err}")
    finally:
        cursor.close()


def create_connection(conf):
    try:
        connection = mysql.connector.connect(
            host=conf['public']['host'],
            port=conf['public']['port'],
            user=conf['setup']['user'],
            password=conf['setup']['password'],
        )
        return connection
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("err: access denied")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("err: db does not exist")
        else:
            print(f"Error: {err}")
        return None


def create_users_table(connection, conf):
    cursor = connection.cursor()

    cursor.execute(f"USE {conf['public']['database']};")

    table_query = """
    CREATE TABLE IF NOT EXISTS users (
        uuid VARCHAR(36) PRIMARY KEY,
        username VARCHAR(36) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(97) NOT NULL,
        date_of_creation TIMESTAMP,
        last_logged_in TIMESTAMP
    );
    """

    try:
        cursor.execute(table_query)
        print("Table 'users' created successfully.")
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        cursor.close()


def create_posts_table(connection, conf):
    cursor = connection.cursor()

    cursor.execute(f"USE {conf['public']['database']};")

    table_query = """
    CREATE TABLE IF NOT EXISTS posts (
        uuid VARCHAR(36) PRIMARY KEY NOT NULL,
        creator VARCHAR(36),
        title VARCHAR(64) NOT NULL,
        comment VARCHAR(512),
        likes BIGINT NOT NULL DEFAULT 0,
        date_of_creation TIMESTAMP NULL,
        FOREIGN KEY (creator) REFERENCES users(uuid)
    );
    """

    try:
        cursor.execute(table_query)
        print("Table 'posts' created successfully.")
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        cursor.close()


def create_functions_table(connection, conf):
    cursor = connection.cursor()

    cursor.execute(f"USE {conf['public']['database']};")

    table_query = """
    CREATE TABLE IF NOT EXISTS functions (
        ID BIGINT PRIMARY KEY AUTO_INCREMENT NOT NULL,
        post VARCHAR(36) NOT NULL,
        func VARCHAR(1024) NOT NULL,
        color VARCHAR(8),
        stroke_size INT NOT NULL,
        FOREIGN KEY (post) REFERENCES posts(uuid)
    );
    """

    try:
        cursor.execute(table_query)
        cursor.execute("ALTER TABLE functions AUTO_INCREMENT=1;")
        print("Table 'posts' created successfully.")
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        cursor.close()


def create_user_db(connection, conf):
    cursor = connection.cursor()
    
    user_query = f"""
    CREATE USER IF NOT EXISTS '{conf['db']['user']}'@'localhost' IDENTIFIED BY '{conf['db']['password']}';
    GRANT SELECT, INSERT ON {conf['public']['database']}.* TO '{conf['db']['user']}'@'localhost';
    FLUSH PRIVILEGES;
    """

    try:
        cursor.execute(user_query)
        print("success creating user")
    except mysql.connector.Error as err:
        print(f"err: {err}")
    finally:
        cursor.close()


def setup_database():
    conf = json.load(open(os.path.dirname(__file__) + '/db_config.json'))
    connection = create_connection(conf)

    if connection is not None:
        create_database(connection, conf)
        create_users_table(connection, conf)
        create_posts_table(connection, conf)
        create_functions_table(connection, conf)
        create_user_db(connection, conf)

        connection.close()


if __name__ == "__main__":
    setup_database()


