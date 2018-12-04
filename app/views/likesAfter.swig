{% extends 'layout.swig' %}

{% block content %}
  <h1>{{ title }}</h1>
  <p>Welcome to {{ title }}</p>
  {{blog.ts}}
  {{blog.state}}
    {% for posts in blog.img %}
	  <div>
		  	{% for post in posts %}
		 	<div>
		    	{{ post}}
		  	</div>
		 	{% endfor %}
	  </div>
	{% endfor %}
{% endblock %}
