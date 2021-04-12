import Prismic from '@prismicio/client';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar } from 'react-icons/fi';
import { FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);
  const [postsNextPage, setPostsNextPage] = useState(postsPagination.next_page);

  async function loadMorePosts(): Promise<void> {
    const postsResponse = await fetch(
      postsPagination.next_page
    ).then(response => response.json());

    const morePosts = postsResponse.results.map((post: Post) => ({
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    }));

    setPosts([...posts, ...morePosts]);
    setPostsNextPage(postsResponse.next_page);
  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <div className={`${commonStyles.container} ${styles.imgContainer}`}>
        <div className={`${commonStyles.content} ${styles.imgContent}`}>
          <img src="/logo.svg" alt="logo" />
        </div>
      </div>

      <main className={commonStyles.container}>
        <div className={`${commonStyles.content} ${styles.posts}`}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <span>{post.data.subtitle}</span>
                <div className={styles.info}>
                  <FiCalendar />
                  <time>
                    {post?.first_publication_date
                      ? format(
                          new Date(post.first_publication_date),
                          'dd MMM Y',
                          {
                            locale: ptBR,
                          }
                        )
                      : 'Publication Date'}
                  </time>
                  <FiUser />
                  <span>{post.data.author}</span>
                </div>
              </a>
            </Link>
          ))}

          {postsNextPage && (
            <button
              type="button"
              className={styles.loadMore}
              onClick={loadMorePosts}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: [
        'post.uid',
        'post.title',
        'post.subtitle',
        'post.author',
        'post.first_publication_date',
      ],
      orderings: '[document.first_publication_date desc]',
      pageSize: 2,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
    },
  };
};
