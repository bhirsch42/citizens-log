import webapp2
import jinja2
import os
import logging
import time
from google.appengine.api import users
import Database

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

	def get_google_user(self):
		return users.get_current_user()

	def get_user(self):
		return Database.get_user_from_google_user(self.get_google_user())

	# def setSecureCookie(self, name, val, days = None):
	# 	cookie_val = makeSecureVal(str(val))
	# 	if days == None:
	# 		self.response.headers.add_header('Set-Cookie', '%s=%s; Path=/' % (name, cookie_val))
	# 	else:
	# 		expiration = datetime.datetime.now() + datetime.timedelta(days = days)
	# 		self.response.headers.add_header('Set-Cookie', '%s=%s; expires=%s; Path=/;' % (name, cookie_val, expiration.strftime("%a, %d-%b-%Y %H:%M:%S GMT")))

	# def readSecureCookie(self, name):
	# 	cookie_val = self.request.cookies.get(name)
	# 	if cookie_val and checkSecureVal(cookie_val):
	# 		return cookie_val.split('|')[0]
