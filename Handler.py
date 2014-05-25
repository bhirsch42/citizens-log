import webapp2
import jinja2
import os
import logging
import time
import Database
import hmac


class Handler(webapp2.RequestHandler):

	def initialize(self, *a, **kw):
		webapp2.RequestHandler.initialize(self, *a, **kw)
		# Initialize jinja2 environment
		self.template_dir = os.path.join(os.path.dirname(__file__), 'html')
		self.jinja_env = jinja2.Environment(loader=jinja2.FileSystemLoader(self.template_dir), autoescape=True)

	def write(self, *a, **kw):
		self.response.out.write(*a, **kw)

	def render_str(self, template, **params):
		t = self.jinja_env.get_template(template)
		return t.render(params)

	def render(self, template, **kw):
		self.write(self.render_str(template, **kw))

	def render_home(self, passwords_dont_match=False, username_is_taken=False, username_is_invalid=False, entries_length=1, log_user=None, login_error=False):
		user = self.get_user()
		self.render('home.html', passwords_dont_match=passwords_dont_match, username_is_taken=username_is_taken, username_is_invalid=username_is_invalid, entries_length=entries_length, user=user, login_error=login_error)

	def get_user(self, username):
		return Database.get_user(username)

	def set_secure_cookie(self, name, val):
		cookie_val = make_secure_val(val)
		self.response.headers.add_header('Set-Cookie', '%s=%s; Path=/' % (name, cookie_val))

	def read_secure_cookie(self, name):
		cookie_val = self.request.cookies.get(name)
		return cookie_val and check_secure_val(cookie_val)

	def login(self, user):
		self.set_secure_cookie('user_id', str(user.username))

	def logout(self):
		self.response.headers.add_header('Set-Cookie', 'user_id=; Path=/')


	def get_user(self):
		username = self.read_secure_cookie('user_id')
		if not username:
			return None
		return Database.get_user(username)

secret = open('secret.txt').read()

def make_secure_val(val):
	return '%s|%s' % (val, hmac.new(secret, val).hexdigest())

def check_secure_val(secure_val):
	val = secure_val.split('|')[0]
	if secure_val == make_secure_val(val):
		return val










