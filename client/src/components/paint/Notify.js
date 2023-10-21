import React from "react";
import useToggleState from "../../hooks/useToggleState";
import { useQuery, useSubscription } from "@apollo/client";
import { GET_POST } from "../../query/Posts";
import { POST_UPDATED } from "../../subscription/post";

export default function Notify() {
    const { state: viewNoti, toggleState: toggleViewNoti, ref: notiRef } = useToggleState(true);
    const { refetch: refetchPosts } = useQuery(GET_POST);
    const postListRef = React.useRef(null);
    const [posts, setPosts] = React.useState([]);

    useSubscription(POST_UPDATED, {
        onData: ({ data }) => {
            const postData = data.data.postUpdated;
            setPosts(prevPost => [
                ...prevPost,
                {
                    ...postData,
                },
            ]);
        },
    });    

    React.useEffect(() => {
        refetchPosts().then(({ data }) => {
            setPosts(data.getPost);
        });
    }, [refetchPosts]);

    const scroll = () => {
        postListRef.current.scrollTo({
          top: postListRef.current.scrollHeight
        });
    }

    return (
        <div>
            <div onClick={() => {
                toggleViewNoti();
                scroll();
            }} ref={notiRef} className="noti">
                <div 
                    style={{ display: viewNoti ? "none" : "block" }} 
                    className="noti-box scroll"
                    ref={postListRef}
                >
                    {posts.map((post, index) => (
                        <div className="post" key={index}>
                            <p className="post_title">{post.title}</p>
                            <p className="post_desc">{post.desc}</p>
                            <div className="ui_post">
                                {post.img ? (
                                    <img className="img_post" src={post.img} alt={index} />
                                ) : null}
                                {post.link ? (
                                    <a className="button_post" href={post.link}>CLICK</a>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}