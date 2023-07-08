import { readdir, rename } from 'node:fs/promises'
import { join } from 'node:path'

function getRenamedPath(path) {
    return path
        .slice(0, path.length - 'hpp'.length)
        + 'h'
}

export default {
    promptScript: [
        {
            name: 'USE_HPP',
            type: 'confirm',
            message: 'Would you like to use .hpp extension?',
            initial: true
        }
    ],
    onPromptSubmit: $ => {
        $.HDREXT = $.USE_HPP ? '.hpp' : '.h'
    },
    onScaffolded: async (dir, $) => {
        if ($.USE_HPP) return

        const incdir = join(dir, 'inc')
        const hdrdir = join(incdir, 'thisdll')

        for (const fileName of await readdir(hdrdir)) {
            const filePath = join(hdrdir, fileName)

            await rename(filePath, getRenamedPath(filePath))
        }

        const mainHeaderPath = hdrdir + '.hpp'

        await rename(mainHeaderPath, getRenamedPath(mainHeaderPath))
    }
}
