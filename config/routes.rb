Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'application#root'
  post '/login' => 'application#check_login'
  get '/logout' => 'users#logout'

  get '/register' => 'application#register'
  get '/registered' => 'application#registered'
  get '/success' => 'application#success'
  get '/activate/:hash' => 'application#activate'
  patch '/activate/:hash/' => 'application#finalize_activation'
  post '/register' => 'application#do_register'
  post '/user/update' => 'users#user_update'

  get '/editor' => 'authenticated#editor'

  post '/create/note' => 'notes#request_id'
  delete '/reject/note' => 'notes#reject_id'
  get '/get/note' => 'notes#get_note'
  get '/get/notes' => 'notes#get_notes'
  post '/save/note' => 'notes#save_note'
  post '/send/chunk' => 'notes#save_chunk'
  delete '/delete/note' => 'notes#delete_note'
  patch '/save/note/title' => 'notes#save_note_title'

  get '/note/download/as_text' => 'notes#download_text'
  get '/note/download/as_html' => 'notes#download_html'
  get '/note/download/as_pdf' => 'notes#download_pdf'

  get '/user/getid' => 'authenticated#get_current_user_id'
  get '/user/getname' => 'authenticated#get_current_user_name'

  get '/test' => 'application#test'
  get '/test/json' => 'application#test_json'
  post '/test/post' => 'application#test_post'
end
