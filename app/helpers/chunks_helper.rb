require 'singleton'

module ChunksHelper

    class ChunksManager
        include Singleton
        attr_accessor :tmp_chunks, :tmp_title,
        def save_tmp_chunk text, id, idx, quantity, current_user
            unless @tmp_chunks
                @tmp_chunks = []
            end
            p "#{@tmp_chunks.size} VS #{quantity}"
            @tmp_chunks.push({pos: idx, content: text, note_id: id})
            return save_and_clean(current_user, id) if idx + 1 == quantity
            return false
        end

        def save_tmp_chunk_to_update text, id, idx
            @tmp_chunks_update = [] if @tmp_chunks_update.nil?
            @tmp_chunks_update.push ({pos: idx, content: text, note_id: id})
            true
        end

        def reset_tmp_chunks_update current_user
            id = nil
            @tmp_chunks_update.each do |tmp_chunk|
                id = tmp_chunk[:note_id]
                break unless id.nil?
            end

            raise Exception.new "No id was provided within the chunk" if id.nil?

            note = current_user.get_note_inst_by_id id
            raise Exception.new "No note with id #{id} was found." if note.nil?

            if !@tmp_title.nil? && !@tmp_title[:note_id].nil? && !@tmp_title[:note_id].nil? && @tmp_title[:note_id] == id
                note[:title] = @tmp_title[:title]
                @tmp_title = nil
            end

            note[:chunks] = @tmp_chunks_update
            @tmp_chunks_update = nil
            pos = current_user.get_note_pos id
            unless pos < 0
                current_user.notes[pos] = note
            else
                current_user.notes.push note
            end
            save_ok = current_user.save
            unless save_ok
                p "Couldn't save the notes! Errors: #{current_user.errors}"
            end
            save_ok
        end

        def save_tmp_chunk_title title, id
            unless @tmp_title
                @tmp_title = {}
            end
            @tmp_title[:title] = title
            @tmp_title[:note_id] = id
        end

        def save_and_clean current_user, id
            note = current_user.get_note_inst_by_id id
            if note.nil?
                raise Exception.new "This note does not exist."
            end
            note[:chunks] = tmp_chunks
            if tmp_title.nil?
                note[:title] = nil
            elsif tmp_title[:note_id] == id
                note[:title] = tmp_title[:title]
            end
            @tmp_chunks = []
            @tmp_title = nil

            pos = current_user.get_note_pos id
            unless pos < 0
                current_user.notes[pos] = note
            else
                current_user.notes.push note
            end
            save_ok = current_user.save
            unless save_ok
                p "Couldn't save the notes! Errors: #{current_user.errors}"
            end
            save_ok
        end

        def tmp_chunks
            @tmp_chunks
        end

        def tmp_title
            @tmp_title
        end
    end

    def save_tmp_chunk text, id, idx, quantity
        ChunksManager.instance.save_tmp_chunk(text, id, idx, quantity, current_user)
    end

    def save_tmp_chunk_to_update text, id, idx
        ChunksManager.instance.save_tmp_chunk_to_update text, id, idx
    end

    def save_tmp_chunk_title title, id
        ChunksManager.instance.save_tmp_chunk_title(title, id)
    end

    def tmp_chunks
        ChunksManager.instance.tmp_chunks
    end

    def reset_tmp_chunks_update current_user
        ChunksManager.instance.reset_tmp_chunks_update current_user
    end

    def build_all_tmp_chunks

    end

end
