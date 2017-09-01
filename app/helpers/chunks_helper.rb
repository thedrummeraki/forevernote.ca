require 'singleton'

module ChunksHelper

    class ChunksManager
        include Singleton
        attr_accessor :tmp_chunks
        def save_tmp_chunk text, id, idx, quantity, current_user
            unless @tmp_chunks
                @tmp_chunks = []
            end
            p "#{@tmp_chunks.size} VS #{quantity}"
            @tmp_chunks.push({pos: idx, content: text, note_id: id})
            return save_and_clean(current_user, id) if idx + 1 == quantity
            return false
        end

        def tmp_chunks
            @tmp_chunks
        end

        def save_and_clean current_user, id
            note = current_user.get_note_inst_by_id id
            if note.nil?
                raise Exception.new "This note does not exist."
            end
            note[:chunks] = tmp_chunks
            @tmp_chunks = []

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
    end

    def save_tmp_chunk text, id, idx, quantity
        ChunksManager.instance.save_tmp_chunk(text, id, idx, quantity, current_user)
    end

    def tmp_chunks
        ChunksManager.instance.tmp_chunks
    end

    def build_all_tmp_chunks

    end

end