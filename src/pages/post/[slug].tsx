/* eslint-disable react/no-danger */
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { useMemo } from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const readTime = useMemo(() => {
    const HUMAN_READ_WORDS_PER_MINUTE = 200;

    const words = post?.data?.content?.reduce((contentWords, content) => {
      contentWords.push(...content.heading.split(' '));

      const sanitizedContent = RichText.asText(content.body)
        .replace(/[^\w|\s]/g, '')
        .split(' ');

      contentWords.push(...sanitizedContent);

      return contentWords;
    }, []);

    return Math.ceil(words?.length / HUMAN_READ_WORDS_PER_MINUTE);
  }, [post]);

  return (
    <>
      <Head>
        <title>{post?.data?.title} | spacetraveling</title>
      </Head>
      <header className={commonStyles.content}>
        <img
          src={post?.data?.banner.url ?? '/images/carregando.png'}
          alt={post?.data?.author ?? 'Banner'}
          className={styles.banner}
        />
      </header>
      <main className={commonStyles.container}>
        <article className={`${commonStyles.content} ${styles.post}`}>
          <strong>
            {router.isFallback ? 'Carregando...' : post?.data?.title || 'Title'}
          </strong>

          <div className={styles.info}>
            <FiCalendar />
            <time>{post?.first_publication_date || 'Publication date'}</time>
            <FiUser />
            <span>{post?.data?.author || 'Author'}</span>
            <FiClock />
            <span>{readTime ? `${readTime} min` : 'Reading time'}</span>
          </div>

          {post?.data?.content.map(content => (
            <div className={styles.postContent} key={content.heading}>
              <strong>{content.heading}</strong>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(content.body),
                }}
              />
            </div>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 2,
    }
  );

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }));

  return {
    fallback: true,
    paths,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM Y',
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      banner: { url: response.data.banner.url },
      author: response.data.author,
      content: response.data.content,
    },
  };
  return {
    props: {
      post,
    },
    redirect: 60 * 30, // 30 minutes
  };
};
