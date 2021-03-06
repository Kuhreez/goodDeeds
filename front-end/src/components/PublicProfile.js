import React, { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";

const PublicProfile = ({ userInfo }) => {
    const [_userData, setUserData] = useState(userInfo);
    const { user } = useAuth0();



    useEffect(() => {
        if (!_userData) {
            try {
                fetch(`http://localhost:5000/user_profile/${user.email}`)
                    .then(res => res.json())
                    .then(data => setUserData(data))
            } catch (err) {
                console.error(err.message);
            }
        }
    }, [])


    if (!_userData) {
        return <div>Loading..</div>
    }

    return (
        <section key={_userData.email}>            
            <div class="container">
                <section class="section">
                    <div class="container">
                        {/* button : save & continue */}
                        <button class="button is-light is-pulled-right is-hidden">
                            Save & Continue
                        </button>
                        {/* screen title */}
                        <h1 class="title is-size-1">Public Profile</h1>
                    </div>
                    {/* second column */}
                    {/* user info */}
                    <section>
                        <div class="columns">
                            <div class="column mt-6">
                                <figure class="image is-480x480 is-1by1">
                                    <img src="https://i.imgur.com/EPqZ9Ic.png" />
                                </figure>
                            </div>
                            {/* Avatar & User Info */}
                            <div class="column mt-6">
                                <div class="container">
                                    <article class="media">
                                        <figure class="media-left">
                                            <p class="image is-48x48">
                                                <img
                                                    class="is-rounded"
                                                    src={_userData.picture}
                                                />
                                            </p>
                                        </figure>
                                        {/* user full name */}
                                        <div class="media-content">
                                            <div class="content">
                                                <p>
                                                    <strong class="title">{_userData.name}</strong> <br />
                                                    <small>@{_userData.username}</small> <br />
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                </div>
                                {/* Interest Areas */}
                                <label class="label mt-2">Interest Areas</label>
                                <div class="tags has-addons">
                                    <span class="tag is-warning">Seniors</span>
                                    <a class="tag is-delete mr-2"></a>
                                    <span class="tag is-black">Black Lives Matter</span>
                                    <a class="tag is-delete mr-2"></a>
                                    <span class="tag is-primary">LBGTQ</span>
                                    <a class="tag is-delete mr-2"></a>
                                </div>
                                {/* location */}
                                <h3>
                                    <strong>Location</strong>
                                </h3>
                                <h4>{_userData.location}</h4>
                                {/* short bio */}
                                <h3 class="mt-4">
                                    <strong>Short Bio</strong>
                                </h3>
                                <h4>
                                    {_userData.short_bio}
                                </h4>
                                {/* GoodDeed Rating */}
                                <h3 class="mt-4">
                                    <strong>GoodDeed Rating</strong>
                                </h3>
                                <span class="tag is-success is-large">100%</span>
                            </div>
                        </div>
                    </section>
                </section>
            </div>
        </section>
    );
};

export default PublicProfile;