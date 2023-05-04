import fs from "fs"
import path from "path"
import matter from 'gray-matter'

interface Post {
    [key: string]: string | string[]
    id: string
    title: string
    date: string
    lang: string
    content: string
    categories: string[]
    lang_avaliable: string[]
}

const postsDirectory = path.join(process.cwd(), "posts")

export function listLanguages(id: string, fileNames?: string[]): string[] {
    fileNames = fileNames || fs.readdirSync(postsDirectory)
    return fileNames.filter(fn => fn.startsWith(id)).map(fn => fn.split('.')[1])
}

export function getPostData(id: string, lang: string, fileNames?: string[]) {
    const fileContent = fs.readFileSync(path.join(postsDirectory, `${id}.${lang}.md`), 'utf8')
    const postData = matter(fileContent)

    return { 
        id: id,
        lang: lang,
        title: postData.data.title as string,
        date: postData.data.date,
        content: postData.content,
        categories: postData.data.categories || [],
        lang_avaliable: listLanguages(id, fileNames)
    }
}

export function listPosts(): Post[] {
    const fileNames = fs.readdirSync(postsDirectory)
    return fileNames.map(fn => {
        const [id, lang] = fn.split('.')
        return getPostData(id, lang, fileNames)
    }).sort((a, b) => a.id.localeCompare(b.id))
}

export function listCategories(): Set<string> {
    const ret = new Set<string>();

    listPosts().forEach(p => p.categories.forEach(c => ret.add(c)))
    return ret
}