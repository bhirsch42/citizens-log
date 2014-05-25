from Handler import *
from google.appengine.ext import ndb
from google.appengine.api import memcache
import hashlib
import random
from string import letters
from datetime import datetime

users_key = "users"


class Entry(ndb.Model):
	title = ndb.StringProperty(required=True)
	content = ndb.TextProperty(required=True)


class MyUser(ndb.Model):
	page_name = ndb.StringProperty(required=True)
	username = ndb.StringProperty(required=True)
	password_hash = ndb.StringProperty(required=True)
	email = ndb.StringProperty(required=False)
	entries = ndb.StructuredProperty(Entry, repeated=True)

def make_salt(length = 5):
	return ''.join(random.choice(letters) for x in xrange(length))

def make_password_hash(name, pw, salt = None):
	if not salt:
		salt = make_salt()
	h = hashlib.sha256(name + pw + salt).hexdigest()
	return '%s,%s' % (salt, h)

def valid_password(username, password):
	h = get_user(username).password_hash
	salt = h.split(',')[0]
	return h == make_password_hash(username, password, salt)

def add_user(page_name, username, password, email):
	# check if user exists
	if (username in get_all_users()):
		return false

	password_hash = make_password_hash(username, password)

	# add user to datastore
	my_user = MyUser(page_name=page_name, username=username, password_hash=password_hash, email=email, entries=[])
	my_user.put()

	# update memcache
	my_users = memcache.get(users_key)
	add_user_to_dict(my_user, my_users)
	memcache.set(users_key, my_users)

	return True

def add_entry(user, content):
	d = datetime.now()
	title = "%s/%s/%s %s:%s" % (d.month, d.day, d.year % 1000, d.hour, d.minute)
	entry = Entry(title = title, content = content)
	if not user.entries:
		user.entries = [entry]
	else:
		user.entries.append(entry)
	user.put()
	update_user_memcache()

def get_all_users(update=False):
	my_users = memcache.get(users_key)

	# update
	if my_users is None or update:
		update_user_memcache()
		my_users = memcache.get(users_key)

	return my_users


def update_user_memcache():
	registered_users = ndb.gql("SELECT * FROM MyUser")
	my_user_dict = {}
	for registered_user in registered_users:
		add_user_to_dict(registered_user, my_user_dict)
	memcache.set(users_key, my_user_dict)


def add_user_to_dict(my_user, d):
	d[my_user.username] = my_user


def is_registered_user(user, update=False):
	if not user:
		return False

	# check if user exists
	user_exists = user.username() in get_all_users()
	return user_exists


def get_user(username):
	if not username in get_all_users():
		return None
	return get_all_users()[username]


