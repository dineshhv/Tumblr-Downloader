{% extends 'layout.swig' %}

{% block content %}
  <h1>{{ title }}</h1>
  <p>Welcome to {{ title }}</p>
  {{blog.ts}}
  {{blog.state}}
  <a href= "http://localhost:3000/likes/{{blog.page}}" > Next Page</>
  {% for post in blog %}
  	{% for postobj in post.liked_posts %}
	  <div>
	  	{{ postobj.id }}
	    {{postobj.slug}}
	    <br />
	    {% for photo in postobj.photos %}
	    {{photo.original_size.url}}
	    	<!---->
	    {% endfor %}
	  </div>
  	{% endfor %}
  {% endfor %}
{% endblock %}
