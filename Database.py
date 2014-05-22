from Handler import *
from google.appengine.ext import ndb
from google.appengine.api import memcache

users_key = "users"

class Bio(ndb.Model):
	image_url = ndb.StringProperty(required=True)
	description = ndb.TextProperty(required=True)

class MyUser(ndb.Model):
	google_user_id = ndb.StringProperty(required=True)
	first_name = ndb.StringProperty(required=True)
	last_name = ndb.StringProperty(required=True)
	bio = ndb.StructuredProperty(Bio)
	is_a_moderator = ndb.BooleanProperty(required=True)
	has_a_bio = ndb.BooleanProperty(required=True)
	can_create_news_posts = ndb.BooleanProperty(required=True)
	can_edit_calendar = ndb.BooleanProperty(required=True)


def add_user(gid, fname, lname):
	# check if user already exists
	if gid in memcache.get(users_key):
		return False
	bio = Bio(image_url='', description='')
	my_user = MyUser(google_user_id=gid, first_name=fname, last_name=lname, bio=bio,
		is_a_moderator=False, has_a_bio=False, can_create_news_posts=False, can_edit_calendar=False)
	my_user.put()
	# update memcache
	my_users = memcache.get(users_key)
	add_user_to_dict(my_user, my_users)
	memcache.set(users_key, my_users)
	return True

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
	d[my_user.google_user_id] = my_user

def is_registered_user(user, update=False):
	if not user:
		return False

	# check if user exists
	user_exists = user.user_id() in get_all_users()
	return user_exists

def get_user_from_google_user(user):
	if not is_registered_user(user):
		return None
	return memcache.get(users_key)[user.user_id()]