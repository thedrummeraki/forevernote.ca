Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root 'application#root'
  post '/login' => 'application#check_login'
  get '/logout' => 'application#logout'

  get '/register' => 'application#register'
  post '/register' => 'application#do_register'

  get '/editor' => 'application#editor'
  get '/get/note' => 'application#get_note'
  get '/get/notes' => 'application#get_notes'
  post '/save/note' => 'application#save_note'
  patch '/save/note/title' => 'application#save_note_title'

  get '/note/download/as_text' => 'application#download_text'
  get '/note/download/as_html' => 'application#download_html'
  get '/note/download/as_pdf' => 'application#download_pdf'
end
